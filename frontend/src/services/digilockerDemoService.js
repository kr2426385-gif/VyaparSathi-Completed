/**
 * DigiLocker Demo / Mock Integration Service
 * 
 * IMPORTANT:
 * This is a DEMO / MOCK service for prototyping and user-experience evaluation.
 * It does NOT connect to real DigiLocker production APIs.
 * It NEVER collects real credentials, passwords, or personal identity numbers.
 * All document records are explicitly mock demo data with masked identifiers.
 */

const STORAGE_KEY = 'vyapar_digilocker_demo';
const UPLOADED_DOCS_KEY = 'vyapar_uploaded_docs';

// Initial Mock DigiLocker Catalog
const MOCK_DIGILOCKER_CATALOG = [
  {
    id: 'dl_aadhaar_demo',
    category: 'Aadhaar',
    title: 'Aadhaar Card',
    issuer: 'Unique Identification Authority of India (UIDAI)',
    type: 'Government Identity Document',
    docNumber: 'XXXX XXXX 4921',
    isDemo: true,
    status: 'Available',
    issueDate: '12/04/2021',
    details: {
      holderName: 'Demo Entrepreneur',
      gender: 'Male / Female',
      dob: '15/08/1988',
      state: 'Maharashtra',
      maskedNumber: 'XXXX XXXX 4921',
      issuerNote: 'Verified Demo Digital Identity'
    }
  },
  {
    id: 'dl_pan_demo',
    category: 'PAN',
    title: 'PAN Card',
    issuer: 'Income Tax Department, Govt of India',
    type: 'Tax Identification Document',
    docNumber: 'XXXXX1234F',
    isDemo: true,
    status: 'Available',
    issueDate: '05/11/2019',
    details: {
      holderName: 'Demo Entrepreneur',
      panNumber: 'XXXXX1234F',
      parentName: 'Demo Guardian',
      dob: '15/08/1988',
      issuerNote: 'Income Tax Dept (Demo)'
    }
  },
  {
    id: 'dl_dl_demo',
    category: 'Other',
    title: 'Driving Licence',
    issuer: 'Transport Department, Govt of Maharashtra',
    type: 'Transport & Identity Document',
    docNumber: 'MH-11-2018-0098765',
    isDemo: true,
    status: 'Available',
    issueDate: '22/02/2018',
    details: {
      holderName: 'Demo Entrepreneur',
      licenceNumber: 'MH-11-2018-0098765',
      validTill: '21/02/2038',
      vehicleClass: 'LMV / MCWG',
      issuerNote: 'Motor Vehicles Department (Demo)'
    }
  },
  {
    id: 'dl_edu_demo',
    category: 'Other',
    title: 'Education Certificate',
    issuer: 'Maharashtra State Board of Secondary & Higher Secondary Education',
    type: 'Education Board Record',
    docNumber: 'HSC-2006-887412',
    isDemo: true,
    status: 'Available',
    issueDate: '10/06/2006',
    details: {
      holderName: 'Demo Entrepreneur',
      certificateNumber: 'HSC-2006-887412',
      exam: 'Higher Secondary Certificate Examination',
      stream: 'General Stream',
      result: 'First Class (Demo)',
      issuerNote: 'State Secondary Board (Demo)'
    }
  }
];

export const digilockerDemoService = {
  /**
   * Get current demo connection state
   */
  getConnectionState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {
          isConnected: false,
          connectedMobile: '',
          connectedAt: null,
          importedDocs: []
        };
      }
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading DigiLocker demo state:', e);
      return {
        isConnected: false,
        connectedMobile: '',
        connectedAt: null,
        importedDocs: []
      };
    }
  },

  /**
   * Save connection state
   */
  saveConnectionState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Error saving DigiLocker demo state:', e);
    }
  },

  /**
   * Validate mobile number for demo
   */
  validateMobile(mobile) {
    const clean = String(mobile).replace(/\D/g, '');
    return clean.length === 10;
  },

  /**
   * Simulate sending demo OTP
   */
  sendDemoOtp(mobile) {
    if (!this.validateMobile(mobile)) {
      throw new Error('Please enter a valid 10-digit Indian mobile number.');
    }
    return {
      success: true,
      demoOtp: '123456',
      mobile: String(mobile).replace(/\D/g, '')
    };
  },

  /**
   * Verify demo OTP
   */
  verifyDemoOtp(enteredOtp) {
    const clean = String(enteredOtp || '').trim();
    if (clean === '123456') {
      return { success: true };
    }
    return { 
      success: false, 
      error: 'Invalid demo OTP. Please try again.' 
    };
  },

  /**
   * Return available mock catalog documents
   */
  getAvailableCatalog() {
    return MOCK_DIGILOCKER_CATALOG;
  },

  /**
   * Import selected documents into local demo state
   */
  importSelectedDocuments(selectedDocIds, mobile, userName = 'Demo Entrepreneur') {
    const catalog = this.getAvailableCatalog();
    const imported = catalog
      .filter(doc => selectedDocIds.includes(doc.id))
      .map(doc => ({
        ...doc,
        importedAt: new Date().toISOString(),
        details: {
          ...doc.details,
          holderName: userName || 'Demo Entrepreneur'
        }
      }));

    const state = {
      isConnected: true,
      connectedMobile: mobile,
      connectedAt: new Date().toISOString(),
      importedDocs: imported
    };

    this.saveConnectionState(state);
    return state;
  },

  /**
   * Disconnect demo DigiLocker session
   * Removes imported demo document references while leaving user uploaded documents intact.
   */
  disconnect() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return { success: true };
    } catch (e) {
      console.warn('Error disconnecting DigiLocker demo:', e);
      return { success: false };
    }
  },

  /**
   * User-uploaded documents handling
   */
  getUserUploadedDocuments() {
    try {
      const raw = localStorage.getItem(UPLOADED_DOCS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Error reading uploaded documents:', e);
      return [];
    }
  },

  saveUserUploadedDocument(doc) {
    try {
      const current = this.getUserUploadedDocuments();
      const newDoc = {
        id: 'usr_doc_' + Date.now(),
        category: doc.category || 'Other',
        title: doc.title || 'Uploaded Document',
        fileName: doc.fileName || 'document.pdf',
        fileSize: doc.fileSize || '120 KB',
        uploadedAt: new Date().toISOString(),
        isDemo: false,
        status: 'Uploaded',
        fileData: doc.fileData || null
      };
      const updated = [newDoc, ...current];
      localStorage.setItem(UPLOADED_DOCS_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Error saving uploaded document:', e);
      return this.getUserUploadedDocuments();
    }
  },

  deleteUserUploadedDocument(docId) {
    try {
      const current = this.getUserUploadedDocuments();
      const updated = current.filter(d => d.id !== docId);
      localStorage.setItem(UPLOADED_DOCS_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Error deleting uploaded document:', e);
      return this.getUserUploadedDocuments();
    }
  }
};

export default digilockerDemoService;
