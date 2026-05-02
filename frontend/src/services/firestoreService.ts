/**
 * SyncSpace — Firestore Service Hooks
 * Real-time data sync with Cloud Firestore
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import { firestore } from './firebase';

/** Generic real-time Firestore collection hook */
export function useFirestoreCollection<T extends DocumentData>(
  collectionName: string,
  ...constraints: QueryConstraint[]
) {
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const ref = collection(firestore, collectionName);
      const q = constraints.length > 0 ? query(ref, ...constraints) : query(ref);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as (T & { id: string })[];
          setData(items);
          setLoading(false);
        },
        (err) => {
          console.error(`Firestore error (${collectionName}):`, err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error(`Firestore setup error (${collectionName}):`, err);
      setError(err instanceof Error ? err.message : 'Firestore error');
      setLoading(false);
    }
  }, [collectionName]);

  return { data, loading, error };
}

/** Add a document to a collection */
export async function addDocument(collectionName: string, data: DocumentData) {
  const ref = collection(firestore, collectionName);
  return addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Update a document */
export async function updateDocument(collectionName: string, docId: string, data: DocumentData) {
  const ref = doc(firestore, collectionName, docId);
  return updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Delete a document */
export async function deleteDocument(collectionName: string, docId: string) {
  const ref = doc(firestore, collectionName, docId);
  return deleteDoc(ref);
}

/** Hook for tasks with real-time sync */
export function useTasks() {
  const { data, loading, error } = useFirestoreCollection('tasks', orderBy('createdAt', 'desc'));

  const addTask = useCallback(async (task: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    assignee?: string;
    dueDate?: string;
    labels?: { name: string; color: string }[];
    creatorId: string;
  }) => {
    return addDocument('tasks', task);
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: DocumentData) => {
    return updateDocument('tasks', taskId, updates);
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    return deleteDocument('tasks', taskId);
  }, []);

  return { tasks: data, loading, error, addTask, updateTask, deleteTask };
}

/** Hook for chat messages with real-time sync */
export function useMessages(channelId: string) {
  const { data, loading, error } = useFirestoreCollection(
    `channels/${channelId}/messages`,
    orderBy('createdAt', 'asc')
  );

  const sendMessage = useCallback(async (message: {
    content: string;
    senderId: string;
    senderName: string;
    senderInitials: string;
  }) => {
    return addDocument(`channels/${channelId}/messages`, {
      ...message,
      type: 'text',
    });
  }, [channelId]);

  return { messages: data, loading, error, sendMessage };
}

/** Hook for calendar events */
export function useEvents() {
  const { data, loading, error } = useFirestoreCollection('events', orderBy('date', 'asc'));

  const addEvent = useCallback(async (event: {
    title: string;
    date: string;
    time: string;
    color: string;
    meetLink?: string;
    createdBy: string;
  }) => {
    return addDocument('events', event);
  }, []);

  return { events: data, loading, error, addEvent };
}

/** Hook for activity feed */
export function useActivities() {
  const { data, loading, error } = useFirestoreCollection('activities', orderBy('createdAt', 'desc'));

  const logActivity = useCallback(async (activity: {
    userId: string;
    userName: string;
    userInitials: string;
    action: string;
    target: string;
  }) => {
    return addDocument('activities', activity);
  }, []);

  return { activities: data, loading, error, logActivity };
}
