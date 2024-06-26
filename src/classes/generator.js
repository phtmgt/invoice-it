import Decimal from 'decimal.js';
import fs from 'fs';
import moment from 'moment-timezone';
import path from 'path';
import pug from 'pug';
import i18n from '../lib/i18n';
import Recipient from './recipient';
import Emitter from './emitter';
import Common from './common';

export default class Generator extends Common {
  constructor(config) {
    super();
    this._recipient = (config.recipient) ? new Recipient(config.recipient) : new Recipient();
    this._emitter = (config.emitter) ? new Emitter(config.emitter) : new Emitter();
    this._total_exc_taxes = 0;
    this._total_taxes = 0;
    this._total_inc_taxes = 0;
    this._tax_base = 0;
    this._tax_rate = 0;
    this._article = [];
    this._i18nConfigure(config.language);
    this.hydrate(config.global, this._itemsToHydrate());
  }

  get template() {
    return this._template;
  }

  set template(value) {
    this._template = value;
  }

  get lang() {
    return (!this._lang) ? this._defaultLocale : this._lang;
  }

  set lang(value) {
    const tmp = value.toLowerCase();
    if (!this._availableLocale.includes(tmp)) throw new Error(`Wrong lang, please set one of ${this._availableLocale.join(', ')}`);
    this._lang = tmp;
  }

  get timezone() {
    return (!this._timezone) ? 'Europe/Sofia' : this._timezone;
  }

  set timezone(value) {
    this._timezone = value;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get order_reference_pattern() {
    return (!this._order_reference_pattern) ? '$prefix{OR}$date{YYMM}$separator{-}$id{00000}' : this._order_reference_pattern;
  }

  set order_reference_pattern(value) {
    this._order_reference_pattern = value;
  }

  get invoice_reference_pattern() {
    return (!this._invoice_reference_pattern) ? '$prefix{IN}$date{YYMM}$separator{-}$id{00000}' : this._invoice_reference_pattern;
  }

  set invoice_reference_pattern(value) {
    this._invoice_reference_pattern = value;
  }

  get reference() {
    return this._reference;
  }

  set reference(value) {
    this._reference = value;
  }

  get logo() {
    return this._logo;
  }

  set logo(value) {
    this._logo = value;
  }

  get order_template() {
    return this._order_template;
  }

  set order_template(value) {
    this._order_template = value;
  }

  get debit_note_template() {
    return this._debit_note_template;
  }

  set debit_note_template(value) {
    this._debit_note_template = value;
  }

  get invoice_reference() {
    return this._invoice_reference;
  }

  set invoice_reference(value) {
    this._invoice_reference = value;
  }

  get credit_note_template() {
    return this._credit_note_template;
  }

  set credit_note_template(value) {
    this._credit_note_template = value;
  }

  get pro_forma_template() {
    return this._pro_forma_template;
  }

  set pro_forma_template(value) {
    this._pro_forma_template = value;
  }

  get invoice_template() {
    return this._invoice_template;
  }

  set invoice_template(value) {
    this._invoice_template = value;
  }

  get order_note() {
    return this._order_note;
  }

  set order_note(value) {
    this._order_note = value;
  }

  get invoice_note() {
    return this._invoice_note;
  }

  set invoice_note(value) {
    this._invoice_note = value;
  }

  get invoice_bank_details() {
    return this._invoice_bank_details;
  }

  set invoice_bank_details(value) {
    this._invoice_bank_details = value;
  }

  get footer() {
    return this._footer;
  }

  set footer(value) {
    this._footer = value;
  }

  get date_format() {
    return (!this._date_format) ? 'YYYY/MM/DD' : this._date_format;
  }

  set date_format(value) {
    this._date_format = value;
  }

  get date() {
    return (!this._date) ? moment().tz(this.timezone).format(this.date_format) : this._date;
  }

  set date(value) {
    if (!moment(value).isValid()) throw new Error('Date not valid');
    this._date = moment(value).tz(this.timezone).format(this.date_format);
  }

  get total_exc_taxes() {
    return this._total_exc_taxes;
  }

  set total_exc_taxes(value) {
    this._total_exc_taxes = value;
  }

  get tax_base() {
    return this._tax_base;
  }

  set tax_base(value) {
    this._tax_base = value;
  }

  get tax_rate() {
    return this._tax_rate;
  }

  set tax_rate(value) {
    this._tax_rate = value;
  }

  get total_taxes() {
    return this._total_taxes;
  }

  set total_taxes(value) {
    this._total_taxes = value;
  }

  get total_inc_taxes() {
    return this._total_inc_taxes;
  }

  set total_inc_taxes(value) {
    this._total_inc_taxes = value;
  }

  get article() {
    return this._article;
  }

  /**
   * @description Set
   * @param value
   * @example article({description: 'Licence', tax: 20, price: 100, qt: 1})
   * @example article([
   *  {description: 'Licence', tax: 20, price: 100, qt: 1},
   *  {description: 'Licence', tax: 20, price: 100, qt: 1}
   * ])
   */
  set article(value) {
    const tmp = value;
    this.total_taxes = 0;
    if (Array.isArray(tmp)) {
      // Determine total net amount in order to apply weights to tax rate
      const totalNetAmount = tmp.reduce((accumulator, article) => {
        accumulator = Decimal.add(accumulator, this.round(Decimal.mul(Number(article.price), Number(article.qt)).toNumber())).toNumber();
        return accumulator;
      }, 0);
      // const taxRate = 0;
      for (let i = 0; i < tmp.length; i += 1) {
        this._checkArticle(tmp[i]);

        // Original code

        // tmp[i].total_product_without_taxes = this.formatOutputNumber(tmp[i].price * tmp[i].qt);
        // tmp[i].total_product_taxes = this.formatOutputNumber(this.round(tmp[i].total_product_without_taxes * (tmp[i].tax / 100)));
        // tmp[i].total_product_with_taxes = this.formatOutputNumber(this.round(Number(tmp[i].total_product_without_taxes) + Number(tmp[i].total_product_taxes)));
        // tmp[i].price = this.formatOutputNumber(tmp[i].price);
        // tmp[i].tax = this.formatOutputNumber(tmp[i].tax);
        // this.total_exc_taxes += Number(tmp[i].total_product_without_taxes);
        // this.total_inc_taxes += Number(tmp[i].total_product_with_taxes);
        // this.total_taxes += Number(tmp[i].total_product_taxes);

        // New code

        tmp[i].total_product_without_taxes = this.round(Decimal.mul(Number(tmp[i].price), Number(tmp[i].qt)).toNumber());
        // TODO: Calculate weighted tax rate (simplified VAT case)
        // When totalNetAmount = 0, make weight 0, which makes tax 0;
        // while not logically and mathematically sound, the result is ok (0.00 tax)
        // without breaking with division by zero.
        const weight = Number(totalNetAmount) !== 0 ? Decimal.div(Number(tmp[i].total_product_without_taxes), Number(totalNetAmount)).toNumber() : 0;
        this.tax_rate += Decimal.mul(weight, Number(tmp[i].tax)).toNumber();
        if (Number(tmp[i].tax) !== 0) {
          this.tax_base = this.round(Decimal.add(Number(this.tax_base), Number(tmp[i].total_product_without_taxes)).toNumber());
        }
        this.total_exc_taxes = this.round(Decimal.add(Number(this.total_exc_taxes), Number(tmp[i].total_product_without_taxes)).toNumber());
        tmp[i].tax_amount = this.round(Decimal.mul(Number(tmp[i].total_product_without_taxes), Decimal.div(Number(tmp[i].tax), 100)).toNumber());
        this.total_taxes = this.round(Decimal.add(Number(this.total_taxes), Number(tmp[i].tax_amount)).toNumber());

        // format for display
        tmp[i].total_product_without_taxes = this.formatOutputNumber(tmp[i].total_product_without_taxes, this._lang === 'en' ? '.' : undefined);
        tmp[i].price = this.formatOutputNumber(tmp[i].price, this._lang === 'en' ? '.' : undefined);
        tmp[i].tax = this.formatOutputNumber(tmp[i].tax, this._lang === 'en' ? '.' : undefined);
        tmp[i].qt = this.formatOutputNumber(tmp[i].qt, this._lang === 'en' ? '.' : undefined);
        tmp[i].tax_amount = this.formatOutputNumber(tmp[i].tax_amount, this._lang === 'en' ? '.' : undefined);
      }
    } else {
      this._checkArticle(tmp);

      // Original code

      // tmp.total_product_without_taxes = this.formatOutputNumber(tmp.price * tmp.qt);
      // tmp.total_product_taxes = this.formatOutputNumber(this.round(tmp.total_product_without_taxes * (tmp.tax / 100)));
      // tmp.total_product_with_taxes = this.formatOutputNumber(this.round(Number(tmp.total_product_without_taxes) + Number(tmp.total_product_taxes)));
      // tmp.price = this.formatOutputNumber(tmp.price);
      // tmp.tax = this.formatOutputNumber(tmp.tax);
      // this.total_exc_taxes += Number(tmp.total_product_without_taxes);
      // this.total_inc_taxes += Number(tmp.total_product_with_taxes);
      // this.total_taxes += Number(tmp.total_product_taxes);

      // New code

      tmp.total_product_without_taxes = this.round(Number(tmp.price) * Number(tmp.qt));
      this.tax_rate = Number(tmp.tax);
      if (this.tax_rate !== 0) {
        this.tax_base = Decimal.add(this.round(Number(this.tax_base), Number(tmp.total_product_without_taxes))).toNumber();
      }
      this.total_exc_taxes = this.round(Decimal.add(Number(this.total_exc_taxes), Number(tmp.total_product_without_taxes)).toNumber());
      // tmp.tax_amount = this.round(Decimal.mul(Number(tmp.total_product_without_taxes), Decimal.div(Number(tmp.tax), 100)).toNumber());
      tmp.tax_amount = this.round(Decimal.mul(Number(tmp.total_product_without_taxes), Decimal.div(Number(this.tax_rate), 100)).toNumber());
      this.total_taxes = this.round(Decimal.add(Number(this.total_taxes), Number(tmp.tax_amount)).toNumber());

      // format for display
      tmp.tax_amount = this.formatOutputNumber(tmp.tax_amount, this._lang === 'en' ? '.' : undefined);
      tmp.total_product_without_taxes = this.formatOutputNumber(tmp.total_product_without_taxes, this._lang === 'en' ? '.' : undefined);
      tmp.price = this.formatOutputNumber(tmp.price, this._lang === 'en' ? '.' : undefined);
      tmp.tax = this.formatOutputNumber(tmp.tax, this._lang === 'en' ? '.' : undefined);
      tmp.qt = this.formatOutputNumber(tmp.qt, this._lang === 'en' ? '.' : undefined);
    }

    this._article = (this._article) ? this._article.concat(tmp) : [].concat(tmp);

    // Calculate tax as percentage of total sum, instead of a sum of the individual tax values for each line.
    // We use total_exc_taxes to calculate tax, because tax_rate is weighted:
    // this.total_taxes = this.round(Decimal.mul(Number(this.total_exc_taxes), (Number(this.tax_rate) / 100)).toNumber());
    this.total_inc_taxes = this.round(Decimal.add(Number(this.total_exc_taxes), Number(this.total_taxes)).toNumber());

    // Format for display
    // this.total_exc_taxes = this.formatOutputNumber(this.total_exc_taxes);
    // this.total_taxes = this.formatOutputNumber(this.total_taxes);
    // this.total_inc_taxes = this.formatOutputNumber(this.total_inc_taxes);
  }

  /**
   * @description Reinitialize article attribute
   */
  deleteArticles() {
    this._total_inc_taxes = 0;
    this._total_taxes = 0;
    this._total_exc_taxes = 0;
    this._article = [];
  }

  /**
   * @description Check article structure and data
   * @param article
   * @private
   */
  _checkArticle(article) {
    if (!Object.prototype.hasOwnProperty.call(article, 'description')) throw new Error('Description attribute is missing');
    if (!Object.prototype.hasOwnProperty.call(article, 'tax')) throw new Error('Tax attribute is missing');
    if (!this.isNumeric(article.tax)) throw new Error('Tax attribute have to be a number');
    if (!Object.prototype.hasOwnProperty.call(article, 'price')) throw new Error('Price attribute is missing');
    if (!this.isNumeric(article.price)) throw new Error('Price attribute have to be a number');
    if (!Object.prototype.hasOwnProperty.call(article, 'qt')) throw new Error('Qt attribute is missing');
    if (!this.isNumeric(article.qt)) throw new Error('Qt attribute have to be a number');
    // if (!this.isNumeric(article.tax_amount)) throw new Error('Tax amount attribute have to be a number');
    // if (!Number.isInteger(article.qt)) throw new Error('Qt attribute have to be an integer, not a float');
  }

  /**
   * @description Hydrate from configuration
   * @returns {[string,string,string,string]}
   */
  _itemsToHydrate() {
    return [
      'logo',
      'order_template',
      'invoice_template',
      'date_format',
      'date',
      'order_reference_pattern',
      'invoice_reference_pattern',
      'order_note',
      'invoice_note',
      'lang',
      'footer',
      'timezone',
      'invoice_bank_details',
      'credit_note_template',
      'debit_note_template',
      'invoice_reference',
      'pro_forma_template',
    ];
  }

  /**
   * @description Hydrate recipient object
   * @param obj
   * @returns {*}
   */
  recipient(obj) {
    if (!obj) return this._recipient;
    return this._recipient.hydrate(obj, this._recipient._itemsToHydrate());
  }

  /**
   * @description Hydrate emitter object
   * @param obj
   * @returns {*}
   */
  emitter(obj) {
    if (!obj) return this._emitter;
    return this._emitter.hydrate(obj, this._emitter._itemsToHydrate());
  }

  /**
   * @description Precompile translation to merging glabal with custom translations
   * @returns {{logo: *, header_date: *, table_information, table_description, table_tax, table_tax_amount, table_quantity,
   * table_price_without_taxes, table_price_without_taxes_unit, table_note, table_total_without_taxes, table_tax_base
   * table_total_taxes, table_total_with_taxes, fromto_phone, fromto_mail, footer, moment: (*|moment.Moment)}}
   * @private
   */
  _preCompileCommonTranslations() {
    return {
      logo: this.logo,
      header_date: this.date,
      table_information: i18n.__({ phrase: 'table_information', locale: this.lang }),
      table_description: i18n.__({ phrase: 'table_description', locale: this.lang }),
      table_tax: i18n.__({ phrase: 'table_tax', locale: this.lang }),
      table_tax_amount: i18n.__({ phrase: 'table_tax_amount', locale: this.lang }),
      table_quantity: i18n.__({ phrase: 'table_quantity', locale: this.lang }),
      table_price_without_taxes: i18n.__({ phrase: 'table_price_without_taxes', locale: this.lang }),
      table_price_without_taxes_unit: i18n.__({ phrase: 'table_price_without_taxes_unit', locale: this.lang }),
      table_note: i18n.__({ phrase: 'table_note', locale: this.lang }),
      table_total_without_taxes: i18n.__({ phrase: 'table_total_without_taxes', locale: this.lang }),
      table_tax_base: i18n.__({ phrase: 'table_tax_base', locale: this.lang }),
      table_total_taxes: i18n.__({ phrase: 'table_total_taxes', locale: this.lang }),
      table_total_with_taxes: i18n.__({ phrase: 'table_total_with_taxes', locale: this.lang }),
      fromto_phone: i18n.__({ phrase: 'fromto_phone', locale: this.lang }),
      fromto_mail: i18n.__({ phrase: 'fromto_mail', locale: this.lang }),
      footer: this.getFooter(),
      emitter_name: this.emitter().name,
      emitter_street_number: this.emitter().street_number,
      emitter_street_name: this.emitter().street_name,
      emitter_zip_code: this.emitter().zip_code,
      emitter_city: this.emitter().city,
      emitter_country: this.emitter().country,
      emitter_phone: this.emitter().phone,
      emitter_mail: this.emitter().mail,
      recipient_company: this.recipient().company_name,
      recipient_first_name: this.recipient().first_name,
      recipient_last_name: this.recipient().last_name,
      recipient_street_number: this.recipient().street_number,
      recipient_street_name: this.recipient().street_name,
      recipient_zip_code: this.recipient().zip_code,
      recipient_city: this.recipient().city,
      recipient_country: this.recipient().country,
      recipient_phone: this.recipient().phone,
      recipient_mail: this.recipient().mail,
      articles: this.article,
      table_total_without_taxes_value: this.formatOutputNumber(this.total_exc_taxes, this._lang === 'en' ? '.' : undefined),
      table_tax_base_value: this.formatOutputNumber(this.tax_base, this._lang === 'en' ? '.' : undefined),
      table_total_taxes_value: this.formatOutputNumber(this.total_taxes, this._lang === 'en' ? '.' : undefined),
      table_total_with_taxes_value: this.formatOutputNumber(this.total_inc_taxes, this._lang === 'en' ? '.' : undefined),
      template_configuration: this._templateConfiguration(),
      moment: moment(),
    };
  }

  /**
   * @description Compile pug template to HTML
   * @param keys
   * @returns {*}
   * @private
   */
  _compile(keys) {
    let template;
    switch (keys.filename) {
      case 'order':
        template = this.order_template;
        break;
      case 'credit_note':
        template = this.credit_note_template;
        break;
      case 'debit_note':
        template = this.debit_note_template;
        break;
      case 'pro_forma':
        template = this.pro_forma_template;
        break;
      default:
        template = this.invoice_template;
    }
    // const template = keys.filename === 'order' ? this.order_template : keys.filename === 'credit_note' ? this.credit_note_template : keys.filename === 'debit_note' ? this.debit_note_template : this.invoice_template;
    const compiled = pug.compileFile(path.resolve(template));
    return compiled(keys);
  }

  /**
   * @description Prepare phrases from translations
   * @param type
   */
  getPhrases(type) {
    return {
      header_title: i18n.__({ phrase: `${type}_header_title`, locale: this.lang }),
      header_subject: i18n.__({ phrase: `${type}_header_subject`, locale: this.lang }),
      header_reference: i18n.__({ phrase: `${type}_header_reference`, locale: this.lang }),
      header_date: i18n.__({ phrase: `${type}_header_date`, locale: this.lang }),
      invoice_header_reference: i18n.__({ phrase: `${type}_invoice_header_reference`, locale: this.lang }),
      header_emitter: i18n.__({ phrase: `${type}_header_emitter`, locale: this.lang }),
      header_recipient: i18n.__({ phrase: `${type}_header_recipient`, locale: this.lang }),
    };
  }

  /**
   * @description Return invoice translation keys object
   * @param params
   * @returns {*}
   */
  getInvoice(params = []) {
    const keys = {
      invoice_header_title: this.getPhrases('invoice').header_title,
      invoice_header_subject: this.getPhrases('invoice').header_subject,
      invoice_header_reference: this.getPhrases('invoice').header_reference,
      invoice_header_reference_value: this.getReferenceFromPattern('invoice'),
      invoice_header_date: this.getPhrases('invoice').header_date,
      table_note_content: this.invoice_note,
      table_bank_details_content: this.invoice_bank_details,
      note: (note) => ((note) ? this.invoice_note = note : this.invoice_note),
      filename: 'invoice',
    };
    params.forEach((phrase) => {
      if (typeof phrase === 'string') {
        keys[phrase] = i18n.__({ phrase, locale: this.lang });
      } else if (typeof phrase === 'object' && phrase.key && phrase.value) {
        keys[phrase.key] = phrase.value;
      }
    });

    return Object.assign(keys, {
      toHTML: () => this._toHTML(keys, params),
      toPDF: () => this._toPDF(keys, params),
    }, this._preCompileCommonTranslations());
  }

  /**
   * @description Return invoice translation keys object
   * @param params
   * @returns {*}
   */
  getCreditNote(params = []) {
    const keys = {
      credit_note_header_title: this.getPhrases('credit_note').header_title,
      credit_note_header_subject: this.getPhrases('credit_note').header_subject,
      credit_note_header_reference: this.getPhrases('credit_note').header_reference,
      credit_note_header_reference_value: this.getReferenceFromPattern('credit_note'),
      credit_note_invoice_header_reference: this.getPhrases('credit_note').invoice_header_reference,
      credit_note_invoice_header_reference_value: this.invoice_reference,
      credit_note_header_date: this.getPhrases('credit_note').header_date,
      table_note_content: this.invoice_note,
      table_bank_details_content: this.invoice_bank_details,
      note: (note) => ((note) ? this.invoice_note = note : this.invoice_note),
      filename: 'credit_note',
    };
    params.forEach((phrase) => {
      if (typeof phrase === 'string') {
        keys[phrase] = i18n.__({ phrase, locale: this.lang });
      } else if (typeof phrase === 'object' && phrase.key && phrase.value) {
        keys[phrase.key] = phrase.value;
      }
    });

    return Object.assign(keys, {
      toHTML: () => this._toHTML(keys, params),
      toPDF: () => this._toPDF(keys, params),
    }, this._preCompileCommonTranslations());
  }

  /**
   * @description Return invoice translation keys object
   * @param params
   * @returns {*}
   */
  getDebitNote(params = []) {
    const keys = {
      debit_note_header_title: this.getPhrases('debit_note').header_title,
      debit_note_header_subject: this.getPhrases('debit_note').header_subject,
      debit_note_header_reference: this.getPhrases('debit_note').header_reference,
      debit_note_header_reference_value: this.getReferenceFromPattern('debit_note'),
      debit_note_invoice_header_reference: this.getPhrases('debit_note').invoice_header_reference,
      debit_note_invoice_header_reference_value: this.invoice_reference,
      debit_note_header_date: this.getPhrases('debit_note').header_date,
      table_note_content: this.invoice_note,
      table_bank_details_content: this.invoice_bank_details,
      note: (note) => ((note) ? this.invoice_note = note : this.invoice_note),
      filename: 'debit_note',
    };
    params.forEach((phrase) => {
      if (typeof phrase === 'string') {
        keys[phrase] = i18n.__({ phrase, locale: this.lang });
      } else if (typeof phrase === 'object' && phrase.key && phrase.value) {
        keys[phrase.key] = phrase.value;
      }
    });

    return Object.assign(keys, {
      toHTML: () => this._toHTML(keys, params),
      toPDF: () => this._toPDF(keys, params),
    }, this._preCompileCommonTranslations());
  }

  /**
   * @description Return invoice translation keys object
   * @param params
   * @returns {*}
   */
  getProForma(params = []) {
    const keys = {
      pro_forma_header_title: this.getPhrases('pro_forma').header_title,
      pro_forma_header_subject: this.getPhrases('pro_forma').header_subject,
      pro_forma_header_reference: this.getPhrases('pro_forma').header_reference,
      pro_forma_header_reference_value: this.getReferenceFromPattern('pro_forma'),
      pro_forma_header_date: this.getPhrases('pro_forma').header_date,
      pro_forma_header_emitter: this.getPhrases('pro_forma').header_emitter,
      pro_forma_header_recipient: this.getPhrases('pro_forma').header_recipient,
      table_note_content: this.invoice_note,
      table_bank_details_content: this.invoice_bank_details,
      note: (note) => ((note) ? this.invoice_note = note : this.invoice_note),
      filename: 'pro_forma',
    };
    params.forEach((phrase) => {
      if (typeof phrase === 'string') {
        keys[phrase] = i18n.__({ phrase, locale: this.lang });
      } else if (typeof phrase === 'object' && phrase.key && phrase.value) {
        keys[phrase.key] = phrase.value;
      }
    });

    return Object.assign(keys, {
      toHTML: () => this._toHTML(keys, params),
      toPDF: () => this._toPDF(keys, params),
    }, this._preCompileCommonTranslations());
  }

  /**
   * @description Return order translation keys object
   * @param params
   * @returns {*}
   */
  getOrder(params = []) {
    const keys = {
      order_header_title: this.getPhrases('order').header_title,
      order_header_subject: this.getPhrases('order').header_subject,
      order_header_reference: this.getPhrases('order').header_reference,
      order_header_reference_value: this.getReferenceFromPattern('order'),
      order_header_date: this.getPhrases('order').header_date,
      table_note_content: this.order_note,
      note: (note) => ((note) ? this.order_note = note : this.order_note),
      filename: 'order',
    };
    params.forEach((phrase) => {
      if (typeof phrase === 'string') {
        keys[phrase] = i18n.__({ phrase, locale: this.lang });
      } else if (typeof phrase === 'object' && phrase.key && phrase.value) {
        keys[phrase.key] = phrase.value;
      }
    });

    return Object.assign(keys, {
      toHTML: () => this._toHTML(keys, params),
      toPDF: () => this._toPDF(keys, params),
    }, this._preCompileCommonTranslations());
  }

  /**
   * @description Return right footer
   * @returns {*}
   */
  getFooter() {
    if (!this.footer) return i18n.__({ phrase: 'footer', locale: this.lang });

    if (this.lang === 'en') return this.footer.en;
    if (this.lang === 'fr') return this.footer.fr;
    throw Error('This lang doesn\'t exist.');
  }

  /**
   * @description Return reference from pattern
   * @param type
   * @return {*}
   */
  getReferenceFromPattern(type) {
    if (!['order', 'invoice', 'credit_note', 'debit_note', 'pro_forma'].includes(type)) throw new Error('Type have to be "order" or "invoice"');
    if (this.reference) return this.reference;
    return this.setReferenceFromPattern((type === 'order') ? this.order_reference_pattern : this.invoice_reference_pattern);
  }

  /**
   * @description Set reference
   * @param pattern
   * @return {*}
   * @private
   * @todo optimize it
   */
  setReferenceFromPattern(pattern) {
    const tmp = pattern.split('$').slice(1);
    let output = '';
    // eslint-disable-next-line no-restricted-syntax
    for (const item of tmp) {
      if (!item.endsWith('}')) throw new Error('Wrong pattern type');
      if (item.startsWith('prefix{')) output += item.replace('prefix{', '').slice(0, -1);
      else if (item.startsWith('separator{')) output += item.replace('separator{', '').slice(0, -1);
      else if (item.startsWith('date{')) output += moment().format(item.replace('date{', '').slice(0, -1));
      else if (item.startsWith('id{')) {
        const id = item.replace('id{', '').slice(0, -1);
        if (!/^\d+$/.test(id)) throw new Error(`Id must be an integer (${id})`);
        output += (this._id) ? this.pad(this._id, id.length) : this.pad(0, id.length);
      } else throw new Error(`${item} pattern reference unknown`);
    }
    return output;
  }

  /**
   * @description Export object with html content and exportation functions
   * @param keys
   * @param params
   * @returns {{html: *, toFile: (function(*): *)}}
   * @private
   */
  _toHTML(keys, params = []) {
    // const html = this._compile(keys.filename === 'order' ? this.getOrder(params) : this.getInvoice(params));
    let html;
    switch (keys.filename) {
      case 'order':
        html = this._compile(this.getOrder(params));
        break;
      case 'credit_note':
        html = this._compile(this.getCreditNote(params));
        break;
      case 'debit_note':
        html = this._compile(this.getDebitNote(params));
        break;
      case 'pro_forma':
        html = this._compile(this.getProForma(params));
        break;
      default:
        html = this._compile(this.getInvoice(params));
    }
    return {
      html,
      toFile: (filepath) => this._toFileFromHTML(html, (filepath) || `${keys.filename}.html`),
    };
  }

  /**
   * @description Save content to pdf file
   * @param keys
   * @param params
   * @returns {*}
   * @private
   */
  _toPDF(keys, params = []) {
    const htmlToPdf = this._loadHtmlToPdf();
    const pdf = htmlToPdf.create(this._toHTML(keys, params).html, { timeout: '90000', dpi: '300' });
    return {
      pdf,
      toFile: (filepath) => this._toFileFromPDF(pdf, (filepath) || `${keys.filename}.pdf`),
      toBuffer: () => this._toBufferFromPDF(pdf),
      toStream: (filepath) => this._toStreamFromPDF(pdf, (filepath) || `${keys.filename}.pdf`),
    };
  }

  /**
   * @description Save content into file from toHTML() method
   * @param content
   * @param filepath
   * @returns {Promise}
   * @private
   */
  _toFileFromHTML(content, filepath) {
    return new Promise((resolve, reject) => fs.writeFile(filepath, content, (err) => {
      if (err) reject(err);
      return resolve();
    }));
  }

  /**
   * @description Save content into file from toPDF() method
   * @param content
   * @param filepath
   * @returns {Promise}
   * @private
   */
  _toFileFromPDF(content, filepath) {
    return new Promise((resolve, reject) => content.toFile(filepath, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    }));
  }

  /**
   * @description Export PDF to buffer
   * @param content
   * @returns {*}
   * @private
   */
  _toBufferFromPDF(content) {
    return content.toBuffer((err, buffer) => {
      if (err) throw new Error(err);
      return buffer;
    });
  }

  /**
   * @description Export PDF to file using stream
   * @param content
   * @param filepath
   * @returns {*}
   * @private
   */
  _toStreamFromPDF(content, filepath) {
    return content.toStream((err, stream) => stream.pipe(fs.createWriteStream(filepath)));
  }

  /**
   * @description Calculates number of pages and items per page
   * @return {{rows_in_first_page: number, rows_in_others_pages: number, loop_table: number, articles_count: number}}
   * @private
   */
  _templateConfiguration() {
    const template_rows_per_page = 29;
    const templateConfig = {
      rows_in_first_page: (this.article.length > 19) ? template_rows_per_page : 19,
      rows_per_pages: 43,
      rows_in_last_page: 33,
    };

    let nbArticles = this.article.length;
    templateConfig.articles_count = nbArticles;
    let loop = 1;
    while (true) {
      if (loop === 1) {
        nbArticles -= templateConfig.rows_in_first_page;
        if (nbArticles <= 0) {
          templateConfig.loop_table = (templateConfig.rows_in_first_page !== template_rows_per_page) ? 1 : 2;
          // Just use 1 table, as it is impossible to make multiple tables fit properly
          templateConfig.loop_table = 1;
          return templateConfig;
        }
      }

      if (loop >= 2) {
        if (nbArticles <= templateConfig.rows_in_last_page) {
          templateConfig.loop_table = loop;
          // Just use 1 table, as it is impossible to make multiple tables fit properly
          templateConfig.loop_table = 1;
          return templateConfig;
        }
        nbArticles -= templateConfig.rows_per_pages;
        if (nbArticles <= 0) {
          templateConfig.loop_table = loop;
          // Just use 1 table, as it is impossible to make multiple tables fit properly
          templateConfig.loop_table = 1;
          return templateConfig;
        }
      }
      loop += 1;
    }
  }

  /**
   * @description Overrides i18n configuration
   * @param config
   * @private
   */
  _i18nConfigure(config) {
    this._defaultLocale = (config && config.defaultLocale) ? config.defaultLocale : 'en';
    this._availableLocale = (config && config.locales) ? config.locales : ['en', 'fr'];
    if (config) i18n.configure(config);
  }

  /**
   * @description Loads html-pdf module if available
   * @returns {*}
   * @private
   */
  _loadHtmlToPdf() {
    try {
      /* eslint import/no-unresolved: [2, { ignore: ['html-pdf'] }] */
      return require('html-pdf'); // eslint-disable-line global-require
    } catch (err) {
      throw new Error('Cannot load html-pdf. Try installing it: npm i -S html-pdf@2.2.0');
    }
  }
}
