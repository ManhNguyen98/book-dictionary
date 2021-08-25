import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { Notes } from './notes.entity';
import { NotesService } from './notes.service';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Body() createNoteDto: CreateNoteDto): Promise<Notes> {
    return this.notesService.create(createNoteDto);
  }

  @Get()
  findAll(): Promise<Notes[]> {
    return this.notesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Notes> {
    return this.notesService.findOne(id);
  }

  @Delete(':id')
  deleteOne(@Param('id') id: string): Promise<void> {
    return this.notesService.markDelete(id);
  }
}
