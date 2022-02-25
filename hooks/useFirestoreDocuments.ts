import {useCollection} from "react-firebase-hooks/firestore";
import firebase from "../firebase/client";
import {useMemo} from "react";

const useFirestoreDocuments = <T>(collectionPath: string) => {
  const [collection, loading, error] = useCollection(firebase.firestore().collection(collectionPath));

  const documents = useMemo<T[] | undefined>(() => collection?.docs.map((document: { data: () => any; }) => document.data()), [collection])

  return [documents, loading, error]
}

export default useFirestoreDocuments;
