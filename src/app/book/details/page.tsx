import { Suspense } from "react";
import PassengerDetailsClient from "./PassengerDetailsClient";

export default async function DetailsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const from = (params.from as string) ?? "";
  const to = (params.to as string) ?? "";
  const date = (params.date as string) ?? "";
  const time = (params.time as string) ?? "";
  const type = (params.type as string) ?? "outstation";
  const roundTrip = (params.roundTrip as string) ?? "false";
  const distance = (params.distance as string) ?? "200";
  const vehicleCategoryId = (params.vehicleCategoryId as string) ?? "";
  const vehicleSlug = (params.vehicleSlug as string) ?? "";
  const vehicleName = (params.vehicleName as string) ?? "";
  const totalFare = (params.totalFare as string) ?? "0";
  const baseFare = (params.baseFare as string) ?? "0";
  const driverAllowance = (params.driverAllowance as string) ?? "300";
  const toll = (params.toll as string) ?? "0";
  const gst = (params.gst as string) ?? "0";
  const advanceAmount = (params.advanceAmount as string) ?? "0";

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <PassengerDetailsClient
        from={from}
        to={to}
        date={date}
        time={time}
        type={type}
        roundTrip={roundTrip}
        distance={distance}
        vehicleCategoryId={vehicleCategoryId}
        vehicleSlug={vehicleSlug}
        vehicleName={vehicleName}
        totalFare={totalFare}
        baseFare={baseFare}
        driverAllowance={driverAllowance}
        toll={toll}
        gst={gst}
        advanceAmount={advanceAmount}
      />
    </Suspense>
  );
}
