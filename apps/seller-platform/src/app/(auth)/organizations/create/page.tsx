"use client";

import { OrganizationType } from "@/constants/enum/organization.enum";
import { routes } from "@/constants/routing.constants";
import CustomButton from "@/components/Button";
import CardSelection from "@/components/Card";
import Typography from "@/components/Typography";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormRegisteredIndividual from "./components/FormRegisteredIndividual";
import FormJuristic from "./components/FormJuristic";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrganization } from "@/api/organization.api";
import { createMerchant } from "@/api/merchant.api";
import { useUserStore } from "@/store/user.store";
import { ICreateOrganizationPayload } from "@/interfaces/organization/organization.request.interface";
import { Form } from "antd";
import MerchantFormModal from "./components/MerchantFormModal";
import usePopup from "@/hooks/usePopup";
import { ICreateMerchantPayload } from "@/interfaces/merchant/merchant.request.interface";
import { IAuthOrganization } from "@/interfaces/auth/auth.response.interface";

// Type guard for API errors
interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

const isApiError = (error: unknown): error is ApiError => {
  return typeof error === "object" && error !== null && "response" in error;
};

const OrganizationCreatePage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showPopup, PopupComponent } = usePopup();
  const [orgType, setOrgType] = useState<OrganizationType>(
    OrganizationType.REGISTERED_INDIVIDUAL,
  );
  const { user, setMerchant, setOrganization } = useUserStore();
  const [registeredIndividualForm] = Form.useForm();
  const [juristicForm] = Form.useForm();
  const [isVerified, setIsVerified] = useState(false);
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [pendingOrgPayload, setPendingOrgPayload] =
    useState<ICreateOrganizationPayload | null>(null);

  const { mutate: submitOrganization, isPending: isCreatingOrg } = useMutation({
    mutationFn: (payload: ICreateOrganizationPayload) =>
      createOrganization(payload),
    onSuccess: (response) => {
      console.log("Organization created successfully:", response);
    },
    onError: (error: unknown) => {
      console.error("Error creating organization:", error);
      const apiError = isApiError(error) ? error : null;
      setShowMerchantModal(false);
      showPopup("error", {
        title: "เกิดข้อผิดพลาดในการสร้างองค์กร",
        description:
          apiError?.response?.data?.message || "กรุณาลองใหม่อีกครั้ง",
        statusCode: apiError?.response?.status,
        showConfirm: true,
      });
    },
  });

  const { mutate: submitMerchant, isPending: isCreatingMerchant } = useMutation(
    {
      mutationFn: (payload: ICreateMerchantPayload) => createMerchant(payload),
      onSuccess: async (_, variables) => {
        // Invalidate and refetch the profile queries
        await queryClient.invalidateQueries({
          queryKey: ["dataProfileMerchant"],
        });
        await queryClient.invalidateQueries({ queryKey: ["dataProfile"] });

        // Get the refetched data (same structure as Navbar)
        const dataProfileMerchant = queryClient.getQueryData<{
          merchants: Array<{
            id: number;
            uuid: string;
            slug: string;
            organizeId: number;
            lastAccessedAt: string;
            store?: { storeBranchName?: string };
          }>;
        }>(["dataProfileMerchant"]);

        const dataProfile = queryClient.getQueryData<{
          data?: {
            organizations?: Array<{
              organization: {
                id: number;
                uuid: string;
                organizeName: string;
                organizationType: string;
                kycStatus: string;
              };
              isOwner: boolean;
            }>;
          };
        }>(["dataProfile"]);

        // Find the newly created merchant by slug
        const newMerchant = dataProfileMerchant?.merchants?.find(
          (m) => m.slug === variables.slug,
        );

        if (newMerchant) {
          // Set the merchant in store (same as Navbar)
          setMerchant({
            merchantId: newMerchant.id,
            merchantUuid: newMerchant.uuid,
            merchantSlug: newMerchant.slug,
            merchantName:
              newMerchant.store?.storeBranchName || variables.shopName,
          });

          // Find the organization for this merchant
          const newOrganization = dataProfile?.data?.organizations?.find(
            (org) => org.organization.id === newMerchant.organizeId,
          );

          if (newOrganization) {
            // Set organization in store (same structure as Navbar)
            setOrganization({
              organizeUuid: newOrganization.organization.uuid,
              uuid: newOrganization.organization.uuid,
              organizeId: newOrganization.organization.id,
              organizationDetail: newOrganization as IAuthOrganization,
            });
          }
        }

        showPopup("success", {
          title: "สร้างองค์กรและร้านค้าสำเร็จ",
          description: "คุณสามารถเริ่มใช้งานร้านค้าของคุณได้แล้ว",
          showConfirm: true,
          onOk: () => {
            setShowMerchantModal(false);
            router.push(routes.organizationList());
          },
        });
      },
      onError: (error: unknown) => {
        const apiError = isApiError(error) ? error : null;
        setShowMerchantModal(false);
        showPopup("error", {
          title: "เกิดข้อผิดพลาดในการสร้างร้านค้า",
          description:
            apiError?.response?.data?.message || "กรุณาลองใหม่อีกครั้ง",
          statusCode: apiError?.response?.status,
          showConfirm: true,
        });
      },
    },
  );

  const handleSubmit = async () => {
    try {
      // Button is disabled if !isVerified or !user?.user, so these are guaranteed here
      if (!user?.user) return;

      // Validate form first
      const values = await (
        orgType === OrganizationType.REGISTERED_INDIVIDUAL
          ? registeredIndividualForm
          : juristicForm
      ).validateFields();

      let payload: ICreateOrganizationPayload;

      if (orgType === OrganizationType.REGISTERED_INDIVIDUAL) {
        payload = {
          userId: user.user.id,
          countryCode: user.user.countryCode,
          phoneNumber: user.user.phoneNumber,
          skipRegister: false,
          organizationType: OrganizationType.REGISTERED_INDIVIDUAL,
          registeredIndividualInfo: {
            idCard: values.idCard,
            registrationName: values.registrationName,
            businessType: values.businessType,
            registrationNumber: values.registrationNumber,
            acceptTerms: values.acceptTerms || false,
            businessTypeDescription: values.businessTypeDescription,
          },
        };
      } else {
        payload = {
          userId: user.user.id,
          countryCode: user.user.countryCode,
          phoneNumber: user.user.phoneNumber,
          skipRegister: false,
          organizationType: OrganizationType.JURISTIC,
          juristicInfo: {
            businessType: values.businessType,
            taxId: values.taxId,
            juristicType: values.juristicType,
            juristicTypeId: values.juristicTypeId,
            juristicName: values.juristicName,
            branchName: values.branchName,
            acceptTerms: values.acceptTerms || false,
            businessTypeDescription: values.businessTypeDescription,
            remarkTypeOther: values.remarkTypeOther,
            branchType: "HEAD_OFFICE",
            branchNumber: "00000",
          },
        };
      }

      // Store payload and open merchant modal
      setPendingOrgPayload(payload);
      setShowMerchantModal(true);
    } catch (error: unknown) {
      console.error("Form validation error:", error);
      if (error instanceof Error && error.message) {
        showPopup("error", {
          title: "กรอกข้อมูลไม่ครบถ้วน",
          description: error.message,
          showConfirm: true,
        });
      }
    }
  };

  const handleMerchantSubmit = async (merchantData: { shopName: string }) => {
    if (!pendingOrgPayload || !user?.user) return;

    const slug = `merchant${Date.now()}`;

    // Step 1: Create organization first
    submitOrganization(pendingOrgPayload, {
      onSuccess: (orgResponse) => {
        // Step 2: Create merchant with organization data
        const merchantPayload = {
          phoneNumber: user.user.phoneNumber,
          shopName: merchantData.shopName,
          type: orgType,
          slug,
          skipRegisterStep: true,
          merchantName: merchantData.shopName,
          organizeInfo: {
            cisNumber: orgResponse?.data?.organization.cisNumber || "",
            id: orgResponse?.data?.organization.id || "",
            taxId:
              orgType === OrganizationType.JURISTIC
                ? pendingOrgPayload.juristicInfo?.taxId || ""
                : pendingOrgPayload.registeredIndividualInfo
                    ?.registrationNumber || "",
            juristicType:
              orgType === OrganizationType.JURISTIC
                ? pendingOrgPayload.juristicInfo?.juristicType || ""
                : orgType,
            organizeName: orgResponse?.data?.organization.name || "",
            organizeBranchType: "HEAD_OFFICE",
          },
        };

        submitMerchant(merchantPayload as ICreateMerchantPayload);
      },
    });
  };

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <CustomButton
            variant="link"
            className="!px-0"
            icon={<i className="ri-arrow-left-line" />}
            color="neutral"
            onClick={() => router.push(routes.organizationList())}
          >
            ย้อนกลับ
          </CustomButton>
          <Typography variant="h3">สร้างองค์กรใหม่</Typography>
          <Typography variant="paragraph-small">
            กรอกข้อมูลเพื่อสร้างองค์กรใหม่ของคุณ
          </Typography>
        </div>
        <CustomButton
          variant="solid"
          color="primary"
          onClick={handleSubmit}
          loading={isCreatingOrg || isCreatingMerchant}
          disabled={!isVerified || !user?.user}
        >
          สร้างองค์กรใหม่
        </CustomButton>
      </div>
      <div className="bg-white p-6 mt-6 flex flex-col gap-2 rounded-2xl">
        <Typography variant="paragraph-medium" className="text-text-secondary">
          คุณต้องการสร้างองค์กร และเปิดร้านบน Allkons ในนาม?
        </Typography>
        <div className="w-full flex flex-col md:flex-row gap-2">
          <CardSelection
            isSelected={orgType === OrganizationType.REGISTERED_INDIVIDUAL}
            icon="ri-file-list-3-line"
            label="บุคคลธรรมดาที่จดทะเบียนพาณิชย์"
            onClick={() => {
              setOrgType(OrganizationType.REGISTERED_INDIVIDUAL);
              registeredIndividualForm.resetFields();
              setIsVerified(false);
            }}
          />
          <CardSelection
            isSelected={orgType === OrganizationType.JURISTIC}
            icon="ri-briefcase-2-line"
            label="นิติบุคคล"
            onClick={() => {
              setOrgType(OrganizationType.JURISTIC);
              juristicForm.resetFields();
              setIsVerified(false);
            }}
          />
        </div>
        {orgType === OrganizationType.REGISTERED_INDIVIDUAL ? (
          <FormRegisteredIndividual
            form={registeredIndividualForm}
            onVerificationChange={setIsVerified}
          />
        ) : (
          <FormJuristic
            form={juristicForm}
            onVerificationChange={setIsVerified}
          />
        )}
      </div>

      <MerchantFormModal
        visible={showMerchantModal}
        onClose={() => setShowMerchantModal(false)}
        onSubmit={handleMerchantSubmit}
        loading={isCreatingOrg || isCreatingMerchant}
        firstName={user?.user?.firstNameTh}
        lastName={user?.user?.lastNameTh}
        username={user?.user?.username}
        closable
      />

      <PopupComponent />
    </div>
  );
};

export default OrganizationCreatePage;
