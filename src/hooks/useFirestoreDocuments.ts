import firebase from 'firebase/compat';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';

import { firestore } from '../lib/firebase';
import FirestoreError = firebase.firestore.FirestoreError;
import QuerySnapshot = firebase.firestore.QuerySnapshot;
const useFirestoreDocuments = <T>(collectionPath: string, withId?: boolean) => {
  const [data, loading, error] = useCollection(collection(firestore, collectionPath)) as [
    data: QuerySnapshot<T> | undefined,
    loading: boolean,
    error: FirestoreError | undefined,
  ];

  const documents = useMemo<T[] | undefined>(
    () =>
      data?.docs.map((document) =>
        withId ? { ...document.data(), id: document.id } : document.data(),
      ),
    [data],
  );

  return { documents, loading, error };
};

export default useFirestoreDocuments;
