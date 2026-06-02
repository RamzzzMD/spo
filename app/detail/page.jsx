import DetailClient from "@/components/DetailClient";

export default async function DetailPage({ searchParams }) {
  const params = await searchParams;

  const track = {
    title: params?.title || "",
    artist: params?.artist || "",
    duration: params?.duration || "",
    thumb: params?.thumb || "",
    url: params?.url || "",
    urlpreview: params?.preview || ""
  };

  return <DetailClient track={track} />;
}
