"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Typography, Button } from "@/design-system";

const adminModules = [
  {
    category: "SP Management",
    items: [
      {
        title: "SP Applications",
        description: "Review, approve, reject SP applications. KYC verification.",
        route: "/design-mocks/admin/sp-partners/applications",
        icon: "ri-file-list-3-line",
      },
      {
        title: "SP Network",
        description: "Manage SP profiles, service areas, hierarchy (Leader → Member).",
        route: "/design-mocks/admin/sp-partners",
        icon: "ri-team-line",
      },
      {
        title: "Training Management",
        description: "Track SP training progress, certifications, assign retraining.",
        route: "/design-mocks/admin/training",
        icon: "ri-graduation-cap-line",
      },
    ],
  },
  {
    category: "Commission & Finance",
    items: [
      {
        title: "Commission Policies",
        description: "Configure commission rates by Global/Category/Seller/SP Tier/Campaign.",
        route: "/design-mocks/admin/commissions/policies",
        icon: "ri-settings-3-line",
      },
      {
        title: "Fee Monitoring",
        description: "Track fee collection status: Not Calculated → Collected.",
        route: "/design-mocks/admin/commissions/fee-monitoring",
        icon: "ri-money-dollar-circle-line",
      },
      {
        title: "Payout Batches",
        description: "Create and process SP commission payout batches.",
        route: "/design-mocks/admin/commissions/payouts",
        icon: "ri-bank-card-line",
      },
      {
        title: "Commission Monitoring",
        description: "Monitor commission lifecycle: Estimated → Confirmed → Paid.",
        route: "/design-mocks/admin/commissions/monitoring",
        icon: "ri-line-chart-line",
      },
      {
        title: "Exceptions & Adjustments",
        description: "Handle stuck commissions, clawbacks, manual adjustments.",
        route: "/design-mocks/admin/commissions/exceptions",
        icon: "ri-error-warning-line",
      },
    ],
  },
  {
    category: "Disputes & Audit",
    items: [
      {
        title: "Disputes",
        description: "Manage dispute resolution, circumvention reports, mediation.",
        route: "/design-mocks/admin/disputes",
        icon: "ri-scales-3-line",
      },
      {
        title: "Audit Logs",
        description: "View all admin actions: policy changes, payouts, adjustments.",
        route: "/design-mocks/admin/commissions/audit-logs",
        icon: "ri-history-line",
      },
    ],
  },
  {
    category: "System",
    items: [
      {
        title: "User Management",
        description: "Manage admin/leader accounts, create users, assign roles.",
        route: "/design-mocks/admin/users",
        icon: "ri-user-settings-line",
      },
      {
        title: "Roles & Permissions",
        description: "Configure role-based access control across portal features.",
        route: "/design-mocks/admin/roles",
        icon: "ri-shield-keyhole-line",
      },
    ],
  },
];

const AdminHomePage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <Typography variant="h2" className="!text-text-primary">
            Allkons Admin Portal
          </Typography>
          <Typography variant="paragraph-medium" className="!text-text-tertiary !mt-2">
            Manage SP network, commissions, disputes, and system settings.
          </Typography>
        </div>

        <div className="space-y-10">
          {adminModules.map((category) => (
            <div key={category.category}>
              <Typography variant="h5" className="!text-text-primary !mb-4 !pb-2 border-b border-border-primary">
                {category.category}
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((item) => (
                  <div
                    key={item.title}
                    className="bg-white rounded-lg border border-border-primary p-5 hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => router.push(item.route)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-background-brand-subtle flex items-center justify-center shrink-0">
                        <i className={`${item.icon} text-xl text-text-brand`} />
                      </div>
                      <div>
                        <Typography variant="label-large" className="!text-text-primary !mb-1">
                          {item.title}
                        </Typography>
                        <Typography variant="paragraph-small" className="!text-text-secondary">
                          {item.description}
                        </Typography>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border-primary">
          <Typography variant="caption-medium" className="!text-text-tertiary">
            Allkons Admin Portal v0.1.0 — Port 3003
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
