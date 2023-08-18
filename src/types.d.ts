export interface OfficesResponse {
  offices: {
    _attributes: {
      result: string;
    };
    office: {
      _attributes: {
        name: string;
        shortname: string;
      };
      _text: string;
    };
  };
}
