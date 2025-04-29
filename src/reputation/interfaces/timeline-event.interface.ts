
export interface TimelineEvent {
     type: 'endorsement' | 'project' | 'rating'; 
     title: string;
     description: string;
     date: Date;
   }
   