import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import writeXlsxFile from "write-excel-file";

export default class databaseAccess {
  constructor() {
    this.firebaseConfig = {
      apiKey: "AIzaSyAatZER7xu9iLd70W9-9oakWt-dack6RlI",
      authDomain: "pass-lighter.firebaseapp.com",
      projectId: "pass-lighter",
      storageBucket: "pass-lighter.appspot.com",
      messagingSenderId: "107893130111",
      appId: "1:107893130111:web:592bc2cf586e158cb7104a",
      measurementId: "G-K91YL2964Z",
    };
    this.app = initializeApp(this.firebaseConfig);
    this.db = getFirestore(this.app);
  }

  async getLighters() {
    // const lightersCol = collection(this.db, "lighters");
    // const lightersSnapShot = await getDocs(lightersCol);
    // const lighterList = lightersSnapShot.docs.map((doc) => doc.data());

    const querySnapshot = await getDocs(collection(this.db, "lighters"));
    const lighters = [];
    querySnapshot.forEach((doc) => {
      lighters.push(doc.data());
    });

    return lighters;
    // return lighterList;
  }

  async createLighter(userId) {
    await setDoc(doc(this.db, "lighters", userId), {
      nickname: "",
      locations: [],
      messages: [],
      id: userId,
      log : []
    });
  }

  async giveNickname(id, nickname) {
    const lighterRef = doc(this.db, "lighters", id);
    setDoc(lighterRef, { nickname: nickname }, { merge: true });
  }

  async postMessage(id, message, nickName) {
    const docRef = doc(this.db, "lighters", id);
    const docSnap = await getDoc(docRef);
    let messages = [];
    let date = new Date();
    let stringDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
    if (docSnap.exists()) {
      messages = docSnap.data().messages;
      messages.push({
        nickname: nickName,
        message: message,
        date: stringDate,
      });
    } else {
      console.log("No such document!");
    }
    const lighterRef = doc(this.db, "lighters", id);
    await setDoc(lighterRef, { messages: messages }, { merge: true });
  }

  async randomCodeGenerator(number) {
    let objects = [];
    for (let i = 0; i < number; i++) {
      let code = window
        .btoa(
          String.fromCharCode(
            ...window.crypto.getRandomValues(new Uint8Array(5 * 2))
          )
        )
        .replace(/[+/]/g, "")
        .substring(0, 5)
        .toUpperCase();
      let repeated = false;
      objects.forEach(obj => {
        if (obj.id === code) {
          repeated = true;
          i++;
          console.log('repeated!!!!', obj.id, code);
        }
      })

      if (!repeated) {
        objects.push({ id: code });
      }
    }
    const schema = [
      {
        column: "id",
        type: String,
        value: (lighter) => lighter.id,
      },
    ];
    await writeXlsxFile(objects, {
      schema,
      fileName: "./file.xlsx",
    });
    objects.forEach(o => {
      this.createLighter(o.id);
    })
  }
}
