import React, { memo } from "react";
import { Tooltip } from "antd";
import TextWithTooltip from "@/components/TextWithTooltip/TextWithTooltip";
import CustomTypography from "@/components/Typography";
import styles from "./MatchingResultsDetails.module.css";

interface HeaderData {
  filename: string;
  quantity: number;
  status: string;
  statusLabel: string;
  className?: string;
  statusIcon?: string;
  importedBy: string;
  importDate: string;
}

interface MatchingHeaderProps {
  headerData: HeaderData;
}

const decodeFileName = (filename: string) => {
  try {
    return decodeURIComponent(escape(filename));
  } catch (error) {
    try {
      return decodeURIComponent(filename);
    } catch (e) {
      return filename;
    }
  }
};

const MatchingHeader = memo(({ headerData }: MatchingHeaderProps) => {
  const decodedFilename = decodeFileName(headerData.filename);

  return (
    <div className={`mb-6 p-0 bg-white ${styles.headerSection}`}>
      <div className="px-6 py-4">
        <CustomTypography variant="paragraph-small-semibold" className="!text-text-secondary">
          ข้อมูลการนำเข้าสินค้า
        </CustomTypography>
      </div>

      <div className={styles.dividerLine}></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
        <div>
          <CustomTypography variant="paragraph-small-semibold">
            ไฟล์ที่นำเข้า
          </CustomTypography>
          <TextWithTooltip text={decodedFilename} maxLines={2}>
            <span className={`block text-sm font-medium ${styles.dataValue}`}>
              {decodedFilename}
            </span>
          </TextWithTooltip>
        </div>

        <div>
          <CustomTypography variant="paragraph-small-semibold">
            สินค้านำเข้า
          </CustomTypography>
          <span className={`block text-sm font-medium ${styles.dataValue}`}>
            {headerData.quantity} รายการ
          </span>
        </div>

        <div>
          <CustomTypography variant="paragraph-small-semibold">
            สถานะ
          </CustomTypography>
          <div>
            <CustomTypography variant="paragraph-small" className={styles.dataValue}>
              {headerData.statusLabel}
            </CustomTypography>
          </div>
        </div>

        <div>
          <CustomTypography variant="paragraph-small-semibold">
            นำเข้าโดย
          </CustomTypography>
          <div className={`block text-sm font-medium ${styles.dataValue}`}>
            {headerData.importedBy}{" "}
            <span className="text-gray-400 font-normal">
              ({headerData.importDate})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

MatchingHeader.displayName = "MatchingHeader";

export default MatchingHeader;
