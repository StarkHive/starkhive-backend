import { EntityRepository, Repository } from 'typeorm';
import { Connection } from '../entities/connection.entity';

@EntityRepository(Connection)
export class ConnectionRepository extends Repository<Connection> {
  async findConnection(requesterId: string, recipientId: string) {
    return this.findOne({
      where: [
        { requester: { id: requesterId }, recipient: { id: recipientId } },
        { requester: { id: recipientId }, recipient: { id: requesterId } }
      ]
    });
  }

  
}
