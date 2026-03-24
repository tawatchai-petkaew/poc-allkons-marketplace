export const juristicTypeList = [
  {
    id: 6,
    label: 'อื่นๆ',
    value: 'OTHER',
    prefix: 'อื่นๆ',
    subfix: null,
  },
  {
    id: 4,
    label: 'บริษัทจำกัด',
    value: 'LIMITED_COMPANY',
    prefix: 'บริษัท',
    subfix: 'จำกัด',
  },
  {
    id: 5,
    label: 'บริษัทมหาชน',
    value: 'PUBLIC_LIMITED_COMPANY',
    prefix: 'บริษัท',
    subfix: 'จำกัด (มหาชน)',
  },
  {
    id: 1,
    label: 'บุคคลทั่วไป',
    value: 'PERSONAL',
    prefix: null,
    subfix: null,
  },
  {
    id: 2,
    label: 'ห้างหุ้นส่วนจำกัด',
    value: 'LIMITED_PARTNERSHIP',
    prefix: 'ห้างหุ้นส่วนจำกัด',
    subfix: null,
  },
  {
    id: 3,
    label: 'ห้างหุ้นส่วนสามัญ',
    value: 'GENERAL_PARTNERSHIP',
    prefix: 'ห้างหุ้นส่วนสามัญ',
    subfix: null,
  },
];

export const businessTypeList = [
  {
    label: 'ร้านค้าตัวแทนจำหน่าย (AGENT)',
    value: 'AGENT',
    link: 'agent_consent',
  },
  {
    label: 'ร้านค้าตัวแทนขนาดใหญ่ (BIGBOX)',
    value: 'BIGBOX',
    link: 'manufacturer_consent',
  },
  {
    label: 'ห้าง Modern trade (MDT)',
    value: 'MDT',
    link: 'manufacturer_consent',
  },
  {
    label: 'ขาย Online (ONL) / SP นักขายอิสระ (SP)',
    value: 'ONL',
    link: 'manufacturer_consent',
  },
  {
    label: 'โรงงาน ผู้ผลิต (FAC)',
    value: 'FAC',
    link: 'manufacturer_consent',
  },
  {
    label: 'อื่นๆ',
    value: 'OTHER',
    link: 'manufacturer_consent',
  },
];
