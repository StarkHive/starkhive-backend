export class CreateMessageDto {
  content: string;
  senderId: string;
  receiverId: string; // Add this property
  roomId: string;
}