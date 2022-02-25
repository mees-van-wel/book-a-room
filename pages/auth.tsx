import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebase from "../firebase/client";
import {useAuthState} from "react-firebase-hooks/auth";
import {useRouter} from "next/router";
import {useEffect} from "react";


const Auth = () => {
  const [user, loading] = useAuthState(firebase.auth())
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) void router.replace('/');
  })

  if (loading || (!loading && user)) return null

  return (
    <div>
      <StyledFirebaseAuth uiConfig={{
        signInSuccessUrl: '/',
        signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID]
      }} firebaseAuth={firebase.auth()} />
    </div>
  );
}

export default Auth;
