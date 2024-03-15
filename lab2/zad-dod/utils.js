export function performTransaction(storeName, mode, action) {
  const transaction = db.transaction([storeName], mode);
  const store = transaction.objectStore(storeName);

  action(store);

  transaction.oncomplete = () => {
    console.log("Transaction completed");
  };

  transaction.onerror = (event) => {
    console.error("Transaction error:", event.target.error);
  };
}

export function addUser(userId) {
  performTransaction("users", "readwrite", (store) => {
    const request = store.add({
      id: userId,
      firstName: "created",
      lastName: "ok",
    });

    request.onsuccess = () =>
      console.log(`User with id: ${userId} added successfully`);

    request.onerror = (event) => {
      console.error("Error adding user:", event.target.error);
    };
  });
}

export async function checkEntityExistence(storeName, entityId, entityType) {
  return new Promise((resolve, reject) => {
    performTransaction(storeName, "readonly", (store) => {
      const request = store.get(entityId);

      request.onsuccess = () => {
        if (request.result === undefined) {
          console.warn(`${entityType} with id: ${entityId} does not exist`);
          resolve(false);
        }
        resolve(true);
      };

      request.onerror = () => {
        console.error(`Error checking if ${entityType} exists`);
      };
    });
  });
}
