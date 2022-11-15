import { Notify } from "notiflix";

import { initializeApp } from "firebase/app";
import { getDatabase, set, ref, enableLogging, update,child, get, onDisconnect} from "firebase/database";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

import { refs } from "../refs";

const firebaseConfig = {
  apiKey: "AIzaSyC-4rY4nDRKj5aiEV1y6Yunj-rDnnZfOMM",
    authDomain: "electrical-science-lms.firebaseapp.com",
   databaseURL:
    'https://electrical-science-lms-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: "electrical-science-lms",
  storageBucket: "electrical-science-lms.appspot.com",
  messagingSenderId: "743223284568",
  appId: "1:743223284568:web:b99401db0caa353a3f8b2d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth();
const user = auth.currentUser;
const dt = new Date();

refs.registrationForm?.addEventListener('submit', logInUser);

 
refs.clickRegistrationBtn?.addEventListener('click', handleRegistration)

function checkUserLogin() {
    const userIsLogin = localStorage.getItem('userIsLogin')
    if (location.pathname === '/registration.html' && userIsLogin === 'true') {
        window.location.href = 'index.html';
    }
    if (userIsLogin === 'false' || userIsLogin === null) {
        if (location.pathname.includes('/registration.html')) {
            return
        } else {
          window.location.href = 'registration.html';  
        }
    }
}
  
checkUserLogin()

function handleRegistration(e) {
    e.preventDefault()
    if (refs.clickRegistrationBtn.textContent === 'Log in') {
        refs.registrationForm.addEventListener('submit', logInUser); 
        refs.registrationForm.removeEventListener('submit', signUpUser);
         refs.notRegisteredText.style.display = 'block'    
        refs.nameInput.style.display = 'none'
        refs.forgotPasswordLink.style.display = 'none'
        refs.clickRegistrationBtn.textContent = 'Зареєструватись'
        refs.submitBtn.value = 'Log in'
    } else {
    refs.registrationForm.removeEventListener('submit', logInUser);     
    refs.registrationForm.addEventListener('submit', signUpUser);
    refs.notRegisteredText.style.display = 'none'    
    refs.nameInput.style.display = 'block'
    refs.forgotPasswordLink.style.display = 'block'
        refs.clickRegistrationBtn.textContent = 'Log in'
        refs.submitBtn.value = 'Sign in'
        }
}

//registration
function signUpUser(e) {
    e.preventDefault();
  const username = refs.registrationForm.elements[0].value;
  const email = refs.registrationForm.elements[1].value;
    const password = refs.registrationForm.elements[2].value;
    
  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      // Signed in
        localStorage.setItem('userIsLogin', true)
        const user = userCredential.user;
      set(ref(database, 'users/' + user.uid), {
        username,
        email: email,
        last_login: dt,
      });
      Notify.success(
        'Congratulations, your account has been successfully created.',
        {
          timeout: 1000,
        }
        );
        setTimeout(() => {
        window.location.href = 'index.html'
        }, 2000)

    })
    .catch(error => {
      const errorCode = error.code;
      const errorMessage = error.message;
      Notify.failure(errorMessage, {
        timeout: 2000,
      });
    });
  e.target.reset();
}



//Login
function logInUser(e) {
  e.preventDefault();

  const email = refs.registrationForm.elements[1].value;
  const password = refs.registrationForm.elements[2].value;

  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      // Signed in
        
        localStorage.setItem('userIsLogin', true);

      const user = userCredential.user;
      const uid = user.uid;

      update(ref(database, 'users/' + user.uid), {
        last_login: dt,
      });
      const dbRef = ref(getDatabase());
      get(child(dbRef, `users/${uid}`))
        .then(snapshot => {
          if (snapshot.exists()) {
  
             console.log(snapshot.val())
               window.location.href = 'index.html'
          } else {
            console.log('No data available');
          }
        })
        .catch(error => {
          console.error(error);
        });
    })
    .catch(error => {
      const errorCode = error.code;
      const errorMessage = error.message;
      Notify.failure(errorMessage, {
        timeout: 2000,
      });
    });
}

//get user data
onAuthStateChanged(auth, user => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    const uid = user.uid;
    const dbRef = ref(getDatabase());
    get(child(dbRef, `users/${uid}`))
      .then(snapshot => {
          if (snapshot.exists()) {
              if (location.pathname.includes('/registration.html')) {
                  return;
              } else {
                  refs.userName.textContent = snapshot.val().username || 'Anonymus'    
              }
              console.log(snapshot.val())
        } else {
          console.log('No data available');
        }
      })
      .catch(error => {
        console.error(error);
      });
    // ...
  } else {
    // User is signed out
    // ...
  }
});

refs.logOutBtn?.addEventListener('click', e => {
     if (e.target.nodeName === 'LI' || e.target.nodeName === 'UL') {
    return
  }
  signOut(auth)
    .then(() => {
      // Sign-out successful.
        localStorage.setItem('userIsLogin', false);
      Notify.success('Successful logged out.', {
        timeout: 1000,
      });
    })
    .catch(error => {
      const errorCode = error.code;
      const errorMessage = error.message;
      Notify.failure(errorMessage, {
        timeout: 2000,
      });
    });
});