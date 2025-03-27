import { Parser, transforms } from 'json2csv';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { TimeEntry } from '../entities/time-entry.entity';
import { Buffer } from 'buffer';

export class ExportUtils {
  private static readonly CSV_FIELDS = [
    {
      label: 'ID',
      value: 'id'
    },
    {
      label: 'Start Time',
      value: 'startTime'
    },
    {
      label: 'End Time',
      value: 'endTime'
    },
    {
      label: 'Duration (hours)',
      value: 'duration'
    },
    {
      label: 'Description',
      value: 'description'
    },
    {
      label: 'Approved',
      value: 'isApproved'
    },
    {
      label: 'Project',
      value: 'project.name'
    },
    {
      label: 'Freelancer',
      value: 'freelancer.name'
    }
  ];

  static async generateCSV(timeEntries: TimeEntry[]): Promise<string> {
    const parser = new Parser({
      fields: this.CSV_FIELDS,
      transforms: [transforms.flatten({ objects: true })],
    });
    
    return parser.parse(timeEntries);
  }

  static async generatePDF(timeEntries: TimeEntry[]): Promise<Buffer> {
    const fonts = {
      Roboto: {
        normal: 'node_modules/roboto-font/fonts/Roboto-Regular.ttf',
        bold: 'node_modules/roboto-font/fonts/Roboto-Medium.ttf',
      },
    };

    const printer = new PdfPrinter(fonts);

    const tableBody = timeEntries.map(entry => [
      { text: entry.project.name, style: 'tableCell' },
      { text: new Date(entry.startTime).toLocaleString(), style: 'tableCell' },
      { text: new Date(entry.endTime).toLocaleString(), style: 'tableCell' },
      { text: entry.duration.toString(), style: 'tableCell' },
      { text: entry.description || '', style: 'tableCell' },
      { text: entry.isApproved ? 'Yes' : 'No', style: 'tableCell' },
    ]);

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Time Tracking Report', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', 'auto', '*', 'auto'],
            body: [
              [
                { text: 'Project', style: 'tableHeader' },
                { text: 'Start Time', style: 'tableHeader' },
                { text: 'End Time', style: 'tableHeader' },
                { text: 'Hours', style: 'tableHeader' },
                { text: 'Description', style: 'tableHeader' },
                { text: 'Approved', style: 'tableHeader' },
              ],
              ...tableBody,
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: 'black',
          fillColor: '#eeeeee',
        },
        tableCell: {
          fontSize: 10,
          margin: [0, 5, 0, 5],
        },
      },
      defaultStyle: {
        font: 'Roboto',
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    return new Promise((resolve, reject) => {
      try {
        const chunks: Buffer[] = [];
        pdfDoc.on('data', chunk => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
