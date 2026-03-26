// biometric.js
import { db, collection, getDocs, query, where, updateDoc, doc } from './firebase-config.js';

let webAuthnSupported = false;
let webAuthnCredential = null;

export function checkWebAuthnSupport() {
  if (window.PublicKeyCredential) {
    webAuthnSupported = true;
    console.log('WebAuthn supported - biometric authentication available');
    return true;
  }
  console.log('WebAuthn not supported - biometric authentication unavailable');
  return false;
}

export async function registerBiometric(studentId, studentName) {
  if (!webAuthnSupported) {
    return { success: false, error: 'Biometric not supported on this device' };
  }
  
  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    
    const publicKeyCredentialCreationOptions = {
      challenge: challenge,
      rp: {
        name: "EduReg",
        id: window.location.hostname
      },
      user: {
        id: new TextEncoder().encode(studentId),
        name: studentName,
        displayName: studentName
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" }
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "required"
      },
      timeout: 60000,
      attestation: "none"
    };
    
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });
    
    if (credential) {
      webAuthnCredential = {
        id: credential.id,
        rawId: Array.from(new Uint8Array(credential.rawId)),
        response: {
          clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
          attestationObject: Array.from(new Uint8Array(credential.response.attestationObject))
        },
        type: credential.type
      };
      
      return { success: true, credential: webAuthnCredential };
    }
    return { success: false, error: 'Registration failed' };
  } catch (error) {
    console.error('Biometric registration error:', error);
    if (error.name === 'NotAllowedError') {
      return { success: false, error: 'Biometric registration cancelled' };
    }
    return { success: false, error: error.message };
  }
}

export async function verifyBiometric(studentId) {
  if (!webAuthnSupported) {
    return { success: false, error: 'Biometric not supported on this device' };
  }
  
  try {
    const q = query(collection(db, 'students'), where('studentId', '==', studentId));
    const snap = await getDocs(q);
    if (snap.empty) {
      return { success: false, error: 'Student not found' };
    }
    
    const student = { id: snap.docs[0].id, ...snap.docs[0].data() };
    if (!student.biometricId) {
      return { success: false, error: 'Biometric not registered for this student' };
    }
    
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    
    const publicKeyCredentialRequestOptions = {
      challenge: challenge,
      allowCredentials: [{
        id: Uint8Array.from(JSON.parse(student.biometricId)),
        type: "public-key"
      }],
      timeout: 60000,
      userVerification: "required"
    };
    
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    });
    
    if (assertion) {
      return { success: true, student: student };
    }
    return { success: false, error: 'Verification failed' };
  } catch (error) {
    console.error('Biometric verification error:', error);
    if (error.name === 'NotAllowedError') {
      return { success: false, error: 'Biometric verification cancelled' };
    }
    return { success: false, error: error.message };
  }
}

export async function saveBiometricToStudent(studentId, biometricData) {
  try {
    const q = query(collection(db, 'students'), where('studentId', '==', studentId));
    const snap = await getDocs(q);
    if (snap.empty) return false;
    
    const studentDoc = snap.docs[0];
    await updateDoc(doc(db, 'students', studentDoc.id), {
      biometricId: JSON.stringify(biometricData.rawId)
    });
    return true;
  } catch (error) {
    console.error('Error saving biometric:', error);
    return false;
  }
}

export function getCurrentBiometricCredential() {
  return webAuthnCredential;
}

export function resetBiometricCredential() {
  webAuthnCredential = null;
}