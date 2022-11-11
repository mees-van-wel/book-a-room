import { doc, DocumentReference } from "firebase/firestore";
import { Collection } from "../enums/collection.enum";
import { firestore } from "../lib/firebase";

export const createRef = <T>(
  collection: Collection,
  id?: string
): DocumentReference<T> | undefined =>
  // @ts-ignore
  id ? doc(firestore, `${collection}/${id}`) : undefined;
