import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { CreateWatchlistDto } from './dto/create-watchlist.dto';
import { UpdateWatchlistDto } from './dto/update-watchlist.dto';

@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Post()
 async addToWatchlist(@Body() createWatchlistDto: CreateWatchlistDto) {
  const result = await this.watchlistService.addToWatchlist(createWatchlistDto);
  return result
  }

  @Get(':recruiterId')
 async getWatchlist(@Param('recruiterId') recruiterId: string) {
    const result = await this.watchlistService.getWatchlist(recruiterId);
    return result
  }

  @Delete(':freelancerId')
 async removeFromWatchlist(@Param('freelancerId') freelancerId: string) {
    const result = await this.watchlistService.removeFromWatchlist(freelancerId);
    return result
    }
}
