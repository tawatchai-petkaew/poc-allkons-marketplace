export const routes = {
  home: () => "/",
  designMocks: {
    spRegister: () => "/design-mocks/sp/register",
    spApply: () => "/design-mocks/sp/apply",
    spStatus: () => "/design-mocks/sp/status",
    spHome: () => "/design-mocks/sp/home",
    adminApplications: () => "/design-mocks/admin/sp/applications",
    adminApplicationDetail: (id: string) => `/design-mocks/admin/sp/applications/${id}`,
  },
};
