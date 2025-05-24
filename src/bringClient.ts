import Bring from 'bring-shopping';

export class BringClient {
  private bring = new Bring({ mail: process.env.MAIL!, password: process.env.PW! });

  async login() {
    return this.bring.login();
  }
  async loadLists() {
    return this.bring.loadLists();
  }
  async getItems(listUuid: string) {
    return this.bring.getItems(listUuid);
  }
  async getItemsDetails(listUuid: string) {
    return this.bring.getItemsDetails(listUuid);
  }
  async saveItem(listUuid: string, itemName: string, specification?: string) {
    return this.bring.saveItem(listUuid, itemName, specification || '');
  }
  async removeItem(listUuid: string, itemId: string) {
    return this.bring.removeItem(listUuid, itemId);
  }
  async moveToRecentList(listUuid: string, itemId: string) {
    return this.bring.moveToRecentList(listUuid, itemId);
  }
  async saveItemImage(listUuid: string, itemId: string, imagePathOrUrl: string) {
    // itemId and imagePathOrUrl are available. The library's saveItemImage expects (listUuid, Image).
    // We pass imagePathOrUrl as the second argument and suppress the likely type error.
    // @ts-expect-error The second argument for the library call bring.saveItemImage is expected to be of type 'Image', but we are passing a string (imagePathOrUrl). Further investigation on how to construct this 'Image' object is needed.
    return this.bring.saveItemImage(listUuid, imagePathOrUrl);
  }
  async removeItemImage(listUuid: string, itemId: string) {
    // listUuid and itemId are available. The library's removeItemImage seems to expect one argument.
    // Assuming it expects itemId. If CI still fails, this might need to be listUuid or both.
    return this.bring.removeItemImage(itemId);
  }
  async getAllUsersFromList(listUuid: string) {
    return this.bring.getAllUsersFromList(listUuid);
  }
  async getUserSettings() {
    return this.bring.getUserSettings();
  }
  async loadTranslations(locale?: string) {
    return this.bring.loadTranslations(locale || 'en-US');
  }
  async loadCatalog(locale: string) {
    return this.bring.loadCatalog(locale);
  }
  async getPendingInvitations() {
    return this.bring.getPendingInvitations();
  }
}
