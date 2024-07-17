class ChargeStation {
  constructor(
    location_name,
    street,
    district,
    city,
    country,
    postal_code,
    latitude,
    longitude,
    description,
    working_day_id,
    pricing,
    phone_number,
    parking_level,
    ordering,
    page,
    page_size,
    order_by
  ) {
    this._location_name = location_name;
    this._street = street;
    this._district = district;
    this._city = city;
    this._country = country;
    this._postal_code = postal_code;
    this._latitude = latitude;
    this._longitude = longitude;
    this._description = description;
    this._working_day_id = working_day_id;
    this._pricing = pricing;
    this._phone_number = phone_number;
    this._parking_level = parking_level;
    this._ordering = ordering;
    this._page = page;
    this._page_size = page_size;
    this._order_by = order_by;
  }

  // Getter and Setter methods

  get location_name() {
    return this._location_name;
  }

  set location_name(value) {
    this._location_name = value;
  }

  get street() {
    return this._street;
  }

  set street(value) {
    this._street = value;
  }

  get district() {
    return this._district;
  }

  set district(value) {
    this._district = value;
  }

  get city() {
    return this._city;
  }

  set city(value) {
    this._city = value;
  }

  get country() {
    return this._country;
  }

  set country(value) {
    this._country = value;
  }

  get postal_code() {
    return this._postal_code;
  }

  set postal_code(value) {
    this._postal_code = value;
  }

  get latitude() {
    return this._latitude;
  }

  set latitude(value) {
    this._latitude = value;
  }

  get longitude() {
    return this._longitude;
  }

  set longitude(value) {
    this._longitude = value;
  }

  get description() {
    return this._description;
  }

  set description(value) {
    this._description = value;
  }

  get working_day_id() {
    return this._working_day_id;
  }

  set working_day_id(value) {
    this._working_day_id = value;
  }

  get pricing() {
    return this._pricing;
  }

  set pricing(value) {
    this._pricing = value;
  }

  get phone_number() {
    return this._phone_number;
  }

  set phone_number(value) {
    this._phone_number = value;
  }

  get parking_level() {
    return this._parking_level;
  }

  set parking_level(value) {
    this._parking_level = value;
  }

  get ordering() {
    return this._ordering;
  }

  set ordering(value) {
    this._ordering = value;
  }

  get page() {
    return this._page;
  }

  set page(value) {
    this._page = value;
  }

  get page_size() {
    return this._page_size;
  }

  set page_size(value) {
    this._page_size = value;
  }

  get order_by() {
    return this._order_by;
  }

  set order_by(value) {
    this._order_by = value;
  }
}

export default  ChargeStation;
