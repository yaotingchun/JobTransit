"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirestore = getFirestore;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let firestoreInstance = null;
function getFirestore() {
    if (firestoreInstance)
        return firestoreInstance;
    try {
        if (firebase_admin_1.default.apps.length > 0) {
            firestoreInstance = firebase_admin_1.default.firestore();
            return firestoreInstance;
        }
        // Path to credentials in root credentials/firebase.json
        const credPath = path_1.default.resolve(__dirname, '../../../credentials/firebase.json');
        if (fs_1.default.existsSync(credPath)) {
            const serviceAccount = JSON.parse(fs_1.default.readFileSync(credPath, 'utf8'));
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id || 'jobtransit',
            });
            firestoreInstance = firebase_admin_1.default.firestore();
            console.log(`[FirebaseAdmin] Initialized successfully for project "${serviceAccount.project_id}"`);
            return firestoreInstance;
        }
    }
    catch (err) {
        console.warn('[FirebaseAdmin] Could not initialize Firebase Admin SDK:', err);
    }
    return null;
}
//# sourceMappingURL=firebaseAdmin.js.map