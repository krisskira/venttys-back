// import { CommerceRepository } from "../src/application/repository/commerce.reposirory";
// import { Day } from "../src/domain/";
// import {
//   Commerce,
//   CommerceScheduleDate,
// } from "../src/domain/commerce.interface";

describe("Repositories", () => {
  test("Pending by implementation", async () => {
    expect("TODO").toBe("TODO");
  });

  //   const commerceRepo = new CommerceRepository();
  //   const commercePhoneNumber = "0123456789";

  // test("Create Commerce", async () => {
  //     const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "holiday"]
  //         .map<CommerceScheduleDate>((day, index) => ({
  //             name: day,
  //             code: <Day>day,
  //             number_day: index + 1,
  //             close: {
  //                 hour: 12,
  //                 minute: 50,
  //             },
  //             enable: true
  //         }))
  //     const commerce: Commerce = {
  //         name: "Commerce Api test",
  //         address: "Address",
  //         commerce_status: "Open",
  //         delivery_price: 0,
  //         delivery_time: "15 min",
  //         messages: {
  //             await: {
  //                 enable: true,
  //                 value: "Message for wait",
  //             },
  //             open: {
  //                 enable: true,
  //                 value: "Message for open"
  //             },
  //             close: {
  //                 enable: true,
  //                 value: "Message for open"
  //             }
  //         },
  //         paymentMehods: [],
  //         phone: commercePhoneNumber,
  //         state: "Valle del cauca",
  //         schedules: {
  //             monday: days[0],
  //             tuesday: days[1],
  //             wednesday: days[2],
  //             thursday: days[3],
  //             friday: days[4],
  //             saturday: days[5],
  //             sunday: days[6],
  //             holiday: days[7],
  //         }
  //     }
  //     return commerceRepo.create(commerce).then( collectionId => {
  //         expect(collectionId.length).toBeGreaterThan(1)
  //     })
  // });

  // test("Get Commerces", async () => {
  //     const commerceRepo = new CommerceRepository()
  //     return commerceRepo.get().then( commerces => {
  //         expect(commerces.length).toBeGreaterThanOrEqual(1)
  //     })
  // });

  // test("Get Commerce by Id", async () => {
  //     const commerceRepo = new CommerceRepository()
  //     return commerceRepo.getByCommercePhone(commercePhoneNumber).then( commerce => {
  //         expect(commerce.length).toEqual(1)
  //     })
  // });
});
