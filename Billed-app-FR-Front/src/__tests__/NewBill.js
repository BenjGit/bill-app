/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import "@testing-library/jest-dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js"

describe("Given I am connected as an employee", () => {

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })

    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
    }))
    // créatio du root
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)

    // charger la page new bill
    router()
    window.onNavigate(ROUTES_PATH.NewBill)
  })

  describe("When I am on NewBill Page", () => {

    let newBill

    beforeEach(() => {

      document.body.innerHTML = NewBillUI()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      newBill = new NewBill({
        document,onNavigate,store: mockStore,localStorage: window.localStorage,
      })
    })

    describe("When I upload a file", () => {
      let handleChangeFile

      beforeEach(() => {
        handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      })
      test("then handleChangeFile should be triggered ", async () => {

        await waitFor(() => screen.getByTestId('file'))
        const inputFile = screen.getByTestId('file')

        inputFile.addEventListener('change', handleChangeFile)

        
        const testFile = new File(['test'], 'test.jpg', { type: 'image/jpg' })

        fireEvent.change(inputFile, {target: { files: [testFile],},})

        // checker le nom du fichier
        expect(screen.getByTestId('file').files[0].name).toBe('test.jpg')

        // check si handlechangefile est appelé
        expect(handleChangeFile).toHaveBeenCalled()

        // check formdata values
        expect(inputFile.files[0]).toEqual(testFile)
      })
      test("should display a file error message", () =>{
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
  
        const newBill = new NewBill({
          document, onNavigate, store:mockStore, localStorage: localStorageMock
        })
  
        const querySelectorSpy = jest.spyOn(newBill.document, "querySelector");
  
        newBill.displayFileErrorMessage("Le fichier doit être au format JPG, JPEG ou PNG.");
  
        // Verify that document.querySelector was called with the correct argument
        expect(querySelectorSpy).toHaveBeenCalledWith('[data-testid="file-error"]');
  
        // Verify that the error message was set correctly
        const fileErrorElement = newBill.document.querySelector('[data-testid="file-error"]');
        expect(fileErrorElement.textContent).toBe("Le fichier doit être au format JPG, JPEG ou PNG.");
  
        // Restore the spy
        querySelectorSpy.mockRestore();
      })
      

    })
    // POST integration test
    describe("When I click on the submit button", () => {

      test("then it should create a new bill", () => {
        const expenseTypeInput = screen.getByTestId('expense-type');
        fireEvent.change(expenseTypeInput, { target: { value: 'Transports' } });
  
        const expenseNameInput = screen.getByTestId('expense-name');
        fireEvent.change(expenseNameInput, { target: { value: 'Test Expense' } });
  
        const datePickerInput = screen.getByTestId('datepicker');
        fireEvent.change(datePickerInput, { target: { value: '2023-10-25' } });
  
        const amountInput = screen.getByTestId('amount');
        fireEvent.change(amountInput, { target: { value: '100' } });
  
        const vatInput = screen.getByTestId('vat');
        fireEvent.change(vatInput, { target: { value: '30' } });
  
        const pctInput = screen.getByTestId('pct');
        fireEvent.change(pctInput, { target: { value: '30' } });
  
        const commentaryInput = screen.getByTestId('commentary');
        fireEvent.change(commentaryInput, { target: { value: 'test' } });
        
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
        const form = screen.getByTestId('form-new-bill')
        form.addEventListener('submit', handleSubmit)
        fireEvent.submit(form)
        expect(handleSubmit).toHaveBeenCalled()
        
        expect(expenseTypeInput.value).toBe("Transports");
        expect(expenseNameInput.value).toBe("Test Expense");
        expect(datePickerInput.value).toBe("2023-10-25"); 
        expect(datePickerInput.value).toBe("2023-10-25"); 
        expect(datePickerInput.value).toBe("2023-10-25"); 
        expect(datePickerInput.value).toBe("2023-10-25"); 
      })
    })

  })

})