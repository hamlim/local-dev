import Sidebar from "../sidebar";

export default async function SidebarPage({
  params: { domainID: activeDomainID },
}: { params: { domainID: string } }) {
  return <Sidebar params={{ domainID: activeDomainID }} />;
}
