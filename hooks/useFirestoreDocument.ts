import { useDocument} from "react-firebase-hooks/firestore";
import {useMemo} from "react";

const useFirestoreDocument = <T>(documentRef: any) => {
  let [document, loading, error] = useDocument(documentRef);

  document = useMemo(() => document?.data(), [document]);

  return [document as T | undefined, loading, error];
}

export default useFirestoreDocument;
