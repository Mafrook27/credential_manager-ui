// src/features/audit/pages/AuditLogPage.tsx

import React, { useState, useEffect } from 'react';
import { adminApi, activityLogUtils, type Activity } from "../api/adminApi";
import { RecentActivityCard } from "../../../common/components/RecentActivityCard";
import { toast } from '../../../common/utils/toast';
import { shouldShowError, getErrorMessage } from '../../../utils/errorHandler';


/**
 * Audit Log Page with Server-Side Pagination
 */
export const AuditLogPage: React.FC = () => {
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState({
    startdate: "", enddate: "", username: "", isslow: "", iserror: ""
  });

  // Fetch activities
  const fetchActivities = async (customFilters?: any, customPage?: number) => {
    setActivitiesLoading(true);
    try {
      const params: any = {
        page: customPage ?? currentPage,
        limit: pageSize,
        sortby: sortField,
        sortorder: sortOrder,
      };

      const activeFilters = customFilters !== undefined ? customFilters : filters;
      if (activeFilters.startdate) params.startdate = activeFilters.startdate;
      if (activeFilters.enddate) params.enddate = activeFilters.enddate;
      if (activeFilters.username) params.username = activeFilters.username;
      if (activeFilters.isslow) params.isslow = activeFilters.isslow;
      if (activeFilters.iserror) params.iserror = activeFilters.iserror;

      const response = await adminApi.fetchActivityLogs(params);
      setActivities(response.data || []);
      setTotalRecords(response.pagination?.total || 0);
      return true;
    } catch (err: any) {
      if (shouldShowError(err)) {
        toast.error(getErrorMessage(err, "Failed to load activity logs"));
      }
      setActivities([]);
      setTotalRecords(0);
      return false;
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [currentPage, pageSize, sortField, sortOrder]);

  const handleRefresh = async () => {
    const emptyFilters = { startdate: "", enddate: "", username: "", isslow: "", iserror: "" };
    setFilters(emptyFilters);
    setCurrentPage(1);
    const success = await fetchActivities(emptyFilters, 1);
    if (success) toast.success("Activity logs refreshed!");
  };

  const handleDownload = () => {
    try {
      activityLogUtils.downloadAsJson(
        activities,
        `activity-logs-${new Date().toISOString().split("T")[0]}.json`
      );
      toast.success("Downloaded successfully!");
    } catch {
      toast.error("Failed to download logs");
    }
  };

  const handleFiltersApply = async (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
    const success = await fetchActivities(newFilters, 1);
    if (success) toast.success("Filters applied successfully");
  };

  return (
    <>
      <div className="container-fluid px-2 pt-3 mt-3 mx-3">
        <h2 className="fs-4 mb-1 fw-bold px-4">Recent Activity</h2>
        <p className="text-muted px-4">Monitor system activities and performance</p>
      </div>

      <div className="bg-white rounded border mt-1 mx-3" style={{ padding: '1rem' }}>
        <RecentActivityCard
          activities={activities}
          loading={activitiesLoading}
          onRefresh={handleRefresh}
          onDownload={handleDownload}
          showFilters
          showPagination
          totalRecords={totalRecords}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          onSortChange={(field, order) => {
            setSortField(field);
            setSortOrder(order);
          }}
          filters={filters}
          onFiltersApply={handleFiltersApply}
        />
      </div>
    </>
  );
};
