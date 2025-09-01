import { stringify } from 'csv-stringify/sync';

export default defineEventHandler(() => {
  const headers = ['Name', 'Email', 'Whatsapp Number', 'Role'];
  const data = [['', '', '', '', '']];

  const csvData = stringify(data, { header: true, columns: headers });

  return new Response(csvData, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=users_template.csv',
    },
  });
});
