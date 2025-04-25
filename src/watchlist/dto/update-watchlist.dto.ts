import { PartialType } from '@nestjs/swagger';
import { CreateWatchlistDto } from './create-watchlist.dto';

export class UpdateWatchlistDto extends PartialType(CreateWatchlistDto) {}
