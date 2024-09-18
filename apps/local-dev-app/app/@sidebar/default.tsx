import Sidebar from "./sidebar";

export default async function SidebarDefault({
  params: { domainID: activeDomainID },
}: { params: { domainID: string } }) {
  return <Sidebar params={{ domainID: activeDomainID }} />;
}
