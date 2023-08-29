import axios from "axios";
import { js2xml, xml2js } from "xml-js";

type SoapObject = Record<string, any>;

export const soapRequest = async <T extends SoapObject>(
  request: string,
  accessToken: string
) => {
  const { data: validationData } = await axios.get(
    `https://login.twinfield.com/auth/authentication/connect/accesstokenvalidation?token=${accessToken}`,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic Ym9vay1hLXJvb206cVVpOGhKVCtTVWtuRVBaNXoxR0oza2pSeCtqeWR0RVM5UT09",
      },
    }
  );

  const apiUrl = validationData["twf.clusterUrl"] as string;

  const xml = js2xml(
    {
      _declaration: {
        _attributes: {
          version: "1.0",
          encoding: "utf-8",
        },
      },
      "soapenv:Envelope": {
        _attributes: {
          "xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
          "xmlns:twin": "http://www.twinfield.com/",
        },
        "soapenv:Header": {
          "twin:Header": {
            "twin:AccessToken": accessToken,
            "twin:CompanyCode": process.env.TW_OFFICE,
          },
        },
        "soapenv:Body": {
          "twin:ProcessXmlString": {
            "twin:xmlRequest": {
              _cdata: request,
            },
          },
        },
      },
    },
    { compact: true, spaces: 4 }
  );

  const { data } = await axios.post(
    `${apiUrl}/webservices/processxml.asmx`,
    xml,
    {
      headers: {
        "Content-Type": "text/xml",
        SOAPAction: "http://www.twinfield.com/ProcessXmlString",
      },
    }
  );

  const xmlResponse: any = xml2js(data, {
    compact: true,
    ignoreComment: true,
  });

  const xmlData =
    xmlResponse["soap:Envelope"]["soap:Body"]["ProcessXmlStringResponse"][
      "ProcessXmlStringResult"
    ]["_text"];

  return xml2js(xmlData, {
    compact: true,
    ignoreComment: true,
  }) as never as T;
};
