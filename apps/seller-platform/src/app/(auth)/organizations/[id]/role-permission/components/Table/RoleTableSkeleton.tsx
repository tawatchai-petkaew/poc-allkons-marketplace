import { Skeleton, Space, Table } from 'antd';

export default function RoleTableSkeleton() {
  const columns = [
    { title: <Skeleton.Input size="small" active />, dataIndex: 'col1' },
    { title: <Skeleton.Input size="small" active />, dataIndex: 'col2' },
    { title: <Skeleton.Input size="small" active />, dataIndex: 'col3' },
  ];

  return <Table columns={columns} dataSource={[]} pagination={false} />;
}
