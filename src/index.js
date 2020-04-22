import generator from './classes';

generator.configure({
  emitter: {
    name: 'Your company',
    street_number: '10',
    street_name: 'wall street',
    zip_code: '77340',
    city: 'New York',
    phone: '01 00 00 00 00',
    mail: 'contact@website.com',
    website: 'www.website.com',
  },
  global: {
    logo: 'http://placehold.it/230x70&text=logo',
    order_reference_pattern: '$prefix{OR}$date{YYMM}$separator{-}$id{00000}',
    invoice_reference_pattern: '$prefix{IN}$date{YYMM}$separator{-}$id{00000}',
    order_template: `${__dirname}/../static/order.pug`,
    order_note: '',
    credit_note_template: `${__dirname}/../static/credit_note.pug`,
    credit_note_note: '',
    debit_note_template: `${__dirname}/../static/debit_note.pug`,
    'debit_note_note': '',
    invoice_template: `${__dirname}/../static/invoice.pug`,
    invoice_note: '',
    invoice_bank_details: '',
    invoice_reference: '',
    date: new Date(),
    date_format: 'DD/MM/YYYY',
    lang: 'en',
    timezone: 'Europe/Sofia'
  },
});

export default generator;
