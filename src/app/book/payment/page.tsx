import { Suspense } from "react";
import PaymentClient from "./PaymentClient";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const getString = (key: string, fallback = "") =>
    (params[key] as string) ?? fallback;

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <PaymentClient
        from={getString("from")}
        to={getString("to")}
        date={getString("date")}
        time={getString("time")}
        type={getString("type", "outstation")}
        roundTrip={getString("roundTrip", "false")}
        distance={getString("distance", "200")}
        vehicleCategoryId={getString("vehicleCategoryId")}
        vehicleSlug={getString("vehicleSlug")}
        vehicleName={getString("vehicleName")}
        totalFare={getString("totalFare", "0")}
        baseFare={getString("baseFare", "0")}
        driverAllowance={getString("driverAllowance", "300")}
        toll={getString("toll", "0")}
        gst={getString("gst", "0")}
        advanceAmount={getString("advanceAmount", "0")}
        passengerName={getString("passengerName")}
        passengerPhone={getString("passengerPhone")}
        passengerEmail={getString("passengerEmail")}
        pickupAddress={getString("pickupAddress")}
        specialRequests={getString("specialRequests")}
      />
    </Suspense>
  );
}
