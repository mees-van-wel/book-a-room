import { DocumentReference } from '@firebase/firestore';
import { useMemo } from 'react';
import { useDocument } from 'react-firebase-hooks/firestore';

const useFirestoreDocument = <T>(documentRef: DocumentReference<T>) => {
  const [data, loading, error] = useDocument<T>(documentRef);

  const document = useMemo(() => data?.data(), [data]);

  return { document, loading, error };
};

export default useFirestoreDocument;
