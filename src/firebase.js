// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import axios from "axios";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKabKopafDn68Np7_I7DbW8BOyilqYEAc",
  authDomain: "harp-10a69.firebaseapp.com",
  projectId: "harp-10a69",
  storageBucket: "harp-10a69.appspot.com",
  messagingSenderId: "817543021959",
  appId: "1:817543021959:web:0dc97f257a0613b2047f22"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const PROVIDER_API_URL = 'api.hcsc.net';

/**
 * Output:
 * [
 *  {
 *    practionerId: "111111222",
 *    practionerName: "John Doe",
 *    practionerScore: 4.9,
 *    practionerSpecialties: ["General Practice", "General Surgery"]
 *    locationAddress: "123 Abbey Road, Springfield, MA"
 *  }
 * ]
 */
export async function searchForProviders(city, state, providerType) {
  const locations = getLocations(city, state);
  const res = [];
  (async () => {
    for (const location of locations) {
      const locationId = location.resource.id;
      const practioners = await getPractionersByLocation(locationId).map((entry) => {
        return {
          practionerId: entry.id,
          practionerName: entry.practioner.display,
          practionerSpecialties: entry.specialty.map((s) => s.coding[0].display)
        }
      });
    }
  })();
  return res;
}

async function getLocations(city, state) {
  const res = await axios.get(`https://${PROVIDER_API_URL}/providerfinder/sapphire/fhir/Location?address-city=${city}&address-state=${state}`);
  const data = res.data;
  return data.entry;
}

async function getPractionersByLocation(locationId) {
  const res = await axios.get(`https://${PROVIDER_API_URL}/providerfinder/sapphire/fhir/PractitionerRole?location=${locationId}`);
  const data = res.data;
  return data.entry;
}

async function getPractionerScore(practionerId) {
  // Create a reference to the cities collection
  const reviewsRef = collection(db, "reviews");

  // Create a query against the collection.
  const q = query(reviewsRef, where("prac_id", "==", practionerId));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data());
  });
}

getPractionerScore('144091789');
