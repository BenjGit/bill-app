/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event';
import BillsUI from "../views/BillsUI.js";

import mockStore from "../__mocks__/store";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js"
import { ROUTES,ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import '@testing-library/jest-dom/extend-expect';


import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      
      expect(windowIcon).toHaveClass('active-icon');

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("fetches bills from mock API GET", async () => {
      // l'utilisateur est connecté en tant qu'employé
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // Créez un élément DOM pour simuler l'application
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      // Activez le router pour la page des factures
      router()
    
      window.onNavigate(ROUTES_PATH.Bills)

      // Attendez que les éléments de la page des factures soient chargés
      await waitFor(() => screen.getByTestId('btn-new-bill'))
      
      // Vérifiez les éléments de la page des factures
      const newbillbtn = screen.getByTestId('btn-new-bill')
      expect(newbillbtn).toHaveTextContent('Nouvelle note de frais');

      const contentPending  = await screen.getByText("pending")
      expect(contentPending).toBeTruthy()
      
      const contentAccepted = await screen.getByText("accepted")
      expect(contentAccepted).toBeTruthy()

      const Transports  = await screen.getByText("Transports")
      expect(Transports).toBeTruthy()
    })
    test("Then newBillsBtn should redirect to newbills page", async () => {
      await waitFor(() => screen.getByTestId('btn-new-bill'))

      const btnNewBill = screen.getByTestId('btn-new-bill')
      btnNewBill.click();

      expect(window.location.hash).toBe(ROUTES_PATH.NewBill);
    })
    test("Then icon eye should render a modal", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = BillsUI({ data: bills })
      await waitFor(() => screen.getAllByTestId('icon-eye')[0])

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const billsTest = new Bills({
        document, onNavigate, store:null, localStorage: window.localStorage
      })

      $.fn.modal = jest.fn() // simuler la fonction modal

      const iconEye = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEye = jest.fn(() => billsTest.handleClickIconEye(iconEye))
      iconEye.addEventListener('click', handleClickIconEye)
      fireEvent.click(iconEye)
      expect(handleClickIconEye).toHaveBeenCalled()
    })
    //vérifie si les factures stockées sont correctement affichées.
    test("it should display bills", async () => {

			const onNavigate = (pathname) => {                                  
				document.body.innerHTML = ROUTES({ pathname });
			};

			const newBills = new Bills({
				document,onNavigate,store: mockStore,localStorage: window.localStorage,
			});

			const spyGetBills = jest.spyOn(newBills, "getBills");                         
			const displayedBills = await newBills.getBills();
      const mockedBills = await mockStore.bills().list();                               

			expect(spyGetBills).toHaveBeenCalledTimes(1);                                 
			expect(mockedBills.length).toBe(displayedBills.length);                       // Vérifie si le nombre de factures stockées = au nombre affiché
		});
  })
})