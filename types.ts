export enum Sender {
  User = 'user',
  Bot = 'bot'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
}

export interface UploadedFile {
  data: string; // base64 string
  mimeType: string;
  name: string;
}

export enum AppState {
  Upload = 'upload',
  Analyzing = 'analyzing',
  Chat = 'chat'
}
