"use client"
import axios from 'axios';
import React, { useState, useEffect } from "react";
import { ref, push, update, remove, set } from 'firebase/database';
import { MdEmail } from "react-icons/md"
import { db, } from "../../../config";
import { FaUser, FaTerminal, FaClock, FaBox, FaList, FaFile, FaEject, FaProductHunt, FaBoxOpen, FaExpand, FaFolder, FaTags, FaUsers, FaShoppingCart, FaChartLine, FaBed, FaCheckCircle, FaCalendarCheck, FaTools, FaUserTag, FaUserAlt, FaDollarSign, FaHashtag, FaPhone, FaIdCard, FaMoneyBillWave, FaCalendarAlt } from "react-icons/fa";
import { useUserCategories, useUserCategoriesTotal } from "@/app/componets/zustand/categories";
import { useUserAccountName, useUserEmail, useUserID, useUserName, useUserPhone } from "@/app/componets/zustand/profile";
import { useUserItems, useUserItemsData, useUserItemsTotal } from "@/app/componets/zustand/items";
import { useUserEmployee } from "@/app/componets/zustand/employees";
import itemsdata from "@/app/data/items";
import categoriesdata from "@/app/data/categories";
import { useUserTheme } from "@/app/componets/zustand/theme";
import { TbXboxX } from "react-icons/tb";
import { TiTick } from "react-icons/ti";
import { QRCodeSVG } from 'qrcode.react';
import { useUserCartReceipt, useUserCartTotalReceipt } from "@/app/componets/zustand/receipt";
import { FaCashRegister, FaBan } from "react-icons/fa";
import { useUserRoom, useUserRoomTotal } from '@/app/componets/zustand/room';
import { useUserRoomCategories, useUserRoomCategoriesTotal } from '@/app/componets/zustand/roomCategories';
import { useUserReserved, useUserReservedData, useUserReservedTotal } from '@/app/componets/zustand/reserve';
import { useUserCheckoutList, useUserCheckoutListData, useUserCheckoutListTotal } from '@/app/componets/zustand/checkoutList';




const Accommodation = () => {

  //// Zustand 
  const Id = useUserID((state) => state.userID)
  const categoriesState = useUserRoomCategories((state) => state.userRoomCategories);
  const categories = Array.isArray(categoriesState) ? categoriesState : [];
  const items = useUserRoom((state) => state.userRoom)
  const roomTotal = useUserRoomTotal((state) => state.userRoomTotal)
  const categoriesTotal = useUserRoomCategoriesTotal((state) => state.userRoomCategoriesTotal)
  const reservation = useUserReserved((state) => state.userReserved)
  const checkoutlist = useUserCheckoutList((state) => state.userCheckoutList)
  const checkoutlistTotal = useUserCheckoutListTotal((state) => state.userCheckoutListTotal)
  const reservationTotal = useUserReservedTotal((state) => state.userReservedTotal)


  const bizName = useUserName((state) => state.userName)
  const userAccountName = useUserAccountName((state) => state.userAccountName)

  const bizEmail = useUserEmail((state) => state.userEmail)
  const bizPhone = useUserPhone((state) => state.userPhone)

  const employees = useUserEmployee((state) => state.userEmployee)

  const theme = useUserTheme((state) => state.userTheme)


  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentError, setPaymentError] = useState("");


  // State to track the selected category
  const [selectedCategory, setSelectedCategory] = useState("");

  const [oldItem, setOldItem] = useState({});

  /////// Select box   mostly for employees
  const [selectEmployee, setSelectEmployee] = useState("");
  const [ticketName, setTicketName] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [idNumber, setIdNumber] = useState("");


  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientIdNumber, setClientIdNumber] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState("");

  const [reservationDate, setReservationDate] = useState("");
  const [duration, setDuration] = useState("1");

  const [clientError, setClientError] = useState("");


  /// Cart functions 
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");

  const selectCat = (catname) => {
    if (catname === selectedCategory) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(catname);
    }

    // Clear search when selecting category
    setSearchTerm("");
  };


let filteredItems = items || [];

// First filter by category if selected
if (selectedCategory) {
  filteredItems = filteredItems.filter(
    (item) => item.RoomCategory === selectedCategory
  );
}

// Then filter by search term if any
if (searchTerm.trim() !== "") {
  const q = searchTerm.toLowerCase();
  filteredItems = filteredItems.filter(
    (item) => (item.Name || "").toLowerCase().includes(q)
  );
}


  const [sendCheckoutModal, setSendCheckoutModal] = useState(false);

  const sendCheckoutModalFun = () => {

    setSendCheckoutModal(false);
  };

  const [cancelCheckoutModal, setCancelCheckoutModal] = useState(false);

  const cancelCheckoutModalFun = () => {

    setCancelCheckoutModal(false);
  };


  const [sendCartModal, setSendCartModal] = useState(false);

  const sendCartModalFun = () => {

    setSendCartModal(false);
  };

  const [cancelCartModal, setCancelCartModal] = useState(false);

  const cancelCartModalFun = () => {

    setCancelCartModal(false);
  };



  ///// Modals
  const [ticketModal, setTicketModal] = useState(false)
  const [receiptDetailsModal, setreceiptDetailsModal] = useState(false)
  const [sendModal, setSendModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState(false);


  const receiptModalFun = () => setReceiptModal(false);

  const sendModalFun = () => {
    setSelectEmployee("");
    setClientName("");
    setClientNameError("");
    setClientPhone("");
    setClientIdNumber("");
    setNumberOfPeople("");

    setCart1("")
    setClientName1("")
    setClientPhone1("")
    setClientIdNumber1("")
    setNumberOfPeople1("")
    setDeleteId("")



    setTicketModal(false)

    setSendModal(false);
  };

  const ticketModalFun = () => {
    setTicketName('')
    setSelectEmployee("")

    setTicketModal(false);
  }

  const [phoneNumber, setPhoneNumber] = useState('');
  const [sendMpesa, setSendMpesa] = useState(false);
  const sendMpesaFun = () => {
    setSelectEmployee("")
    setTicketName('')
    setSendMpesa(false);
  }


  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("total:", total, "type:", typeof total);
    console.log("total:", phoneNumber, "type:", typeof phoneNumber);

    try {
      await axios.post('/api/mpesa', { phoneNumber, total });
      //  setMessage("STK Push sent. Enter PIN on your phone!");
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Payment failed.';
      console.log(err.response?.data?.message)

    } finally {
      console.log("finally")
      //  setLoading(false);
    }
  };


  const receiptDetailsModalFun = () => {

    setreceiptDetailsModal(false);
  }

  /////receipt details modal 
  const [receiptName, setReceiptName] = useState('');
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [receiptNumber, setReceiptNumber] = useState("")

  useEffect(() => {
    const now = new Date();

    const formattedDate = now.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });

    const formattedTime = now.toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const receiptNumber1 = 'MRCS' + Math.floor(100000 + Math.random() * 900000); // Example generator

    setReceiptNumber(receiptNumber1)
    setSelectedDate(formattedDate);
    setSelectedTime(formattedTime);
  }, []);


  const receiptDetailsClose = () => {
    setReceiptModal(true);

    setreceiptDetailsModal(false)
  }

  // const cart = useUserCartReceipt((state) => state.userCartReceipt)


  const addToCart = (item) => {
    const unlimited = item.Stock == "N/A";

    // If stock is numbered and zero → block
    if (!unlimited && item.Stock <= 0) {
      itemOutStockFun();
      return;
    }

    const existingItem = cart.find(
      (cartItem) => cartItem.Name === item.Name
    );

    if (existingItem) {
      // Numbered stock limit check
      if (!unlimited && existingItem.stock >= item.Stock) {
        itemMaxFun();
        return;
      }

      setCart(
        cart.map((cartItem) =>
          cartItem.Name === item.Name
            ? { ...cartItem, stock: cartItem.stock + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, stock: 1 }]);
    }

    setTotal(total + parseFloat(item.Price));
  };

  const handleIncrease = (item) => {
    const unlimited = item.Stock == "N/A";

    if (!unlimited && item.stock >= item.Stock) {
      itemMaxFun();
      return;
    }

    setCart(
      cart.map((cartItem) =>
        cartItem.Name === item.Name
          ? { ...cartItem, stock: cartItem.stock + 1 }
          : cartItem
      )
    );

    setTotal(total + parseFloat(item.Price));
  };


  const handleDecrease = (item) => {
    if (item.stock > 1) {
      setCart(
        cart.map((cartItem) =>
          cartItem.Name === item.Name
            ? { ...cartItem, stock: cartItem.stock - 1 }
            : cartItem
        )
      );
      setTotal(total - parseFloat(item.Price));
    } else {
      handleRemove(item);
    }
  };

  const handleRemove = (item) => {
    setCart(cart.filter((cartItem) => cartItem.Name !== item.Name));
    setTotal(total - parseFloat(item.Price) * item.stock)

  };

  const generateRandomHex = () => {
    const receiptNumber1 = 'MRCS' + Math.floor(100000 + Math.random() * 900000);
    return receiptNumber1;
  };


  const [selectedReservation, setSelectedReservation] = useState(null);


  //// send cart to the database 
  const handleSend = (jina) => {
    if (Id) {

      console.log("jina", jina)

      if (cart) {
        if (total == 0) {

          console.log("total is zero")
          sendFailTotal()

        }

        else {
          try {
            const hexTicket = generateRandomHex();

            const dbRef = ref(db, `web/pos/${Id}/checkoutlist/`);

            const newbranchRef = push(dbRef, {

              EmployeeID: userAccountName,
              CashSale: hexTicket,
              Cart: cart,
              Total: total,
              Type: jina,
              Date: Date.now(),
              ClientName: clientName.trim(),
              ClientPhone: clientPhone ? clientPhone.trim() : "",
              ClientID: clientIdNumber ? clientIdNumber.trim() : "",
              NumberOfPeople: numberOfPeople
                ? Number(numberOfPeople)
                : null,

            });

            const newCreditKey = newbranchRef.key;

            sendModalFun()
            handleCancel()
            updateStockInDatabase(Id, jina, cart);

            if (jina == 'Client') {

              sendSuccess()
            }
            else {

              guestSuccess()
            }

          }
          catch (error) {
            console.log(error)
            sendModalFun()

            if (jina == 'Client') {

              sendFail()
            }
            else {

              guestFail()
            }
          }
        }
      }

      else {
        console.log("did not select employee ")
        sendModalFun()

      }
    }
  };


  //// send cart to the database 
  const handleReserve = () => {
    if (Id) {

      if (cart) {
        if (total == 0) {

          console.log("total is zero")
          sendFailTotal()
        }

        else {
          try {
            const hexTicket = generateRandomHex();

            const dbRef = ref(db, `web/pos/${Id}/reserved/`);

            const newbranchRef = push(dbRef, {

              EmployeeID: userAccountName,
              CashSale: hexTicket,
              Cart: cart,
              Total: total,
              Date: Date.now(),
              ClientName: clientName,
              ClientPhone: clientPhone || "",
              ClientIdNumber: clientIdNumber || "",
              NumberOfPeople: numberOfPeople || "",
              ReservationDate: reservationDate,
              Duration: duration,

            });

            const newCreditKey = newbranchRef.key;


            reservedCheckoutModalFun()
            handleCancel()
            reserveSuccess()

            const jina = "reserved"


            updateStockInDatabase(Id, jina, cart);
          }
          catch (error) {
            console.log(error)
            reservedCheckoutModalFun()
            reserveFail()
          }
        }
      }

      else {
        console.log("did not select employee ")
        reservedCheckoutModalFun()

      }
    }
  };




  /// Update stock
  const updateStockInDatabase = async (id, jina, cartItems) => {
    try {

      const updates = {};

      cartItems.forEach((cartItem) => {

        const itemPath = `web/pos/${id}/room/${cartItem.id}`;

        const currentStock = Number(cartItem.Stock) || 0;
        const currentOccupied = Number(cartItem.Occupied) || 0;
        const currentReserved = Number(cartItem.Reserved) || 0;
        const qty = Number(cartItem.stock) || 0;

        if (cartItem.Stock === "N/A") {
          updates[`${itemPath}/Stock`] = "N/A";
          return;
        }

        // Reserve room
        if (jina === "reserved") {
          updates[`${itemPath}/Stock`] = currentStock - qty;
          updates[`${itemPath}/Reserved`] = currentReserved + qty;
        }

        // Client or Guest occupies room
        if (jina === "Client" || jina === "Guest") {
          updates[`${itemPath}/Stock`] = currentStock - qty;
          updates[`${itemPath}/Occupied`] = currentOccupied + qty;
        }

        // Reserved -> Occupied
        if (jina === "checkout") {
          updates[`${itemPath}/Reserved`] = currentReserved - qty;
          updates[`${itemPath}/Occupied`] = currentOccupied + qty;
        }

        // Occupied -> Stock (cart return)
        if (jina === "cart") {
          updates[`${itemPath}/Stock`] = currentStock + qty;
          updates[`${itemPath}/Occupied`] = currentOccupied - qty;
        }

        // Cancel Reservation (Reserved -> Stock)
        if (jina === "cancelReserve") {
          updates[`${itemPath}/Stock`] = currentStock + qty;
          updates[`${itemPath}/Reserved`] = currentReserved - qty;
        }

        // Cancel Checkout (Occupied -> Stock)
        if (jina === "cancelCheckout") {
          updates[`${itemPath}/Stock`] = currentStock + qty;
          updates[`${itemPath}/Occupied`] = currentOccupied - qty;
        }

      });

      await update(ref(db), updates);
      console.log("No Error updating stock:");

    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  const handleCancel = () => {
    setCart([]);
    useUserCartReceipt.setState({ userCartReceipt: [] })
    setTotal(0);
    useUserCartTotalReceipt.setState({ userCartTotalReceipt: 0 })
  };

  ////  Auto close modals
  const [sendModalSuccess, setSendModalSuccess] = useState(false);
  const [sendModalFail, setSendModalFail] = useState(false);
  const [sendModalFailEmployee, setSendModalFailEmployee] = useState(false);
  const [sendModalFailTotal, setSendModalFailTotal] = useState(false);

  const [reserveModalSuccess, setReserveModalSuccess] = useState(false);
  const [reserveModalFail, setReserveModalFail] = useState(false);


  const [guestModalSuccess, setGuestModalSuccess] = useState(false);
  const [guestModalFail, setGuestModalFail] = useState(false);

  const sendSuccess = () => {
    setSendModalSuccess(true);
    setTimeout(() => setSendModalSuccess(false), 1500);
  };

  const sendFail = () => {
    setSendModalFail(true);
    setTimeout(() => setSendModalFail(false), 1500);
  };


  const guestSuccess = () => {
    setGuestModalSuccess(true);
    setTimeout(() => setGuestModalSuccess(false), 1500);
  };

  const guestFail = () => {
    setGuestModalFail(true);
    setTimeout(() => setGuestModalFail(false), 1500);
  };


  const reserveSuccess = () => {
    setReserveModalSuccess(true);
    setTimeout(() => setReserveModalSuccess(false), 1500);
  };

  const reserveFail = () => {
    setReserveModalFail(true);
    setTimeout(() => setReserveModalFail(false), 1500);
  };


  const sendFailTotal = () => {
    setSendModalFailTotal(true);
    setTimeout(() => setSendModalFailTotal(false), 1500);
  };



  const [ticketModalSuccess, setTicketModalSuccess] = useState(false);
  const [ticketModalFail, setTicketModalFail] = useState(false);
  const [ticketModalFailEmployee, setTicketModalFailEmployee] = useState(false);
  const [ticketModalFailTotal, setTicketModalFailTotal] = useState(false);

  const ticketSuccess = () => {
    setTicketModalSuccess(true);
    setTimeout(() => setTicketModalSuccess(false), 1500);
  };

  const ticketFail = () => {
    setTicketModalFail(true);
    setTimeout(() => setTicketModalFail(false), 1500);
  };

  const ticketfailTotal = () => {
    setTicketModalFailTotal(true);
    setTimeout(() => setTicketModalFailTotal(false), 1500);
  };

  const ticketFailEmployee = () => {
    setTicketModalFailEmployee(true);
    setTimeout(() => setTicketModalFailEmployee(false), 1500);
  };



  const [itemMaxFail, setItemMaxModalFail] = useState(false);
  const [ItemOutStockFail, setItemOutStockModalFail] = useState(false);


  const itemMaxFun = () => {
    setItemMaxModalFail(true);
    setTimeout(() => setItemMaxModalFail(false), 1000);
  };

  const itemOutStockFun = () => {
    setItemOutStockModalFail(true);
    setTimeout(() => setItemOutStockModalFail(false), 1000);
  };

  ///////////////////////////////////////////////////////////////////////////////////////////

  const totalItems = cart.length;
  const totalQty = cart.reduce((sum, item) => sum + parseInt(item.stock), 0);
  const totalWeight = cart.reduce((sum, item) => sum + (parseFloat(item.Weight || 0) * parseInt(item.stock)), 0);

  // VAT Breakdown logic
  const vatBreakdown = {
    A: { vatable: 0, vat: 0 },
    E: { vatable: 0, vat: 0 },
    Z: { vatable: 0, vat: 0 }
  };

  cart.forEach(item => {
    const code = item.vatCode || 'A'; // Default to 'A' if not provided
    const qty = parseInt(item.stock);
    const price = parseFloat(item.Price);
    const vatableAmount = price * qty;
    const vatAmount = code === 'A' ? vatableAmount * 0.16 : 0; // 16% VAT for code A

    if (vatBreakdown[code]) {
      vatBreakdown[code].vatable += vatableAmount;
      vatBreakdown[code].vat += vatAmount;
    }
  });

  const format = (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const [sortConfig, setSortConfig] = useState({ key: "Name", direction: "asc" });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };



  const sortedItems = React.useMemo(() => {
    if (!filteredItems) return [];

    if (!sortConfig.key) return filteredItems;

    return [...filteredItems].sort((a, b) => {
      const { key, direction } = sortConfig;

      if (key === "Name") {
        if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
        if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        return 0;
      } else {
        // numeric sorting for Stock or Price
        return direction === "asc"
          ? a[key] - b[key]
          : b[key] - a[key];
      }
    });
  }, [filteredItems, sortConfig]);


  const handleConfirmSell = (jina) => {

    handleSend(jina); // ✅ proceed

  };

  const handleGuest = (jina) => {

    if (Id) {

      if (cart) {
        if (total == 0) {
          sendFailTotal()
        }

        else {
          try {
            const hexTicket = generateRandomHex();

            const dbRef = ref(db, `web/pos/${Id}/lucrative/`);

            const newbranchRef = push(dbRef, {

              EmployeeID: userAccountName,
              CashSale: hexTicket,
              Cart: cart,
              Total: total,
              Type: jina,
              Date: Date.now(),
              ClientName: clientName.trim(),
              ClientPhone: clientPhone ? clientPhone.trim() : "",
              ClientID: clientIdNumber ? clientIdNumber.trim() : "",
              NumberOfPeople: numberOfPeople
                ? Number(numberOfPeople)
                : null,

            });

            const newCreditKey = newbranchRef.key;

            sendModalFun()
            handleCancel()
            guestSuccess()


          }
          catch (error) {
            console.log(error)
            sendModalFun()
            guestFail()

          }
        }
      }

      else {
        console.log("did not select employee ")
        sendModalFun()

      }
    }

  };

  const handleConfirmReserve = () => {

    handleReserve();        // ✅ proceed
  };

  // Compute summary totals
  // Get the current rooms from your state


  // Unique variables for totals
  const totalUnitsCount = (items || []).length;

  const totalOccupiedRooms = (items || []).reduce(
    (acc, room) => acc + Number(room.Occupied || 0),
    0
  );

  const totalReservedRooms = (items || []).reduce(
    (acc, room) => acc + Number(room.Reserved || 0),
    0
  );

  const totalMaintenanceRooms = (items || []).reduce(
    (acc, room) => acc + Number(room.Maintenance || 0),
    0
  );
  // Available = Stock - (Occupied + Reserved)
const totalAvailableRooms = (items || []).reduce((acc, room) => {
  const stock = Number(room.Stock || 0);
  const occ = Number(room.Occupied || 0);
  const res = Number(room.Reserved || 0);
  return acc + Math.max(stock - occ - res, 0);
}, 0);

  // Guest count (if you track guests per room)
 // const totalGuestRooms = items.reduce((acc, room) => acc + (room.Guest ? 1 : 0), 0);


  // Now plug the totals into reportData
  const reportData = [
    { label: "Total Units", value: totalUnitsCount, icon: <FaBed className={`text-3xl ${theme === "Dark" ? "text-violet-400" : "text-violet-600"}`} /> },
    { label: "Available", value: totalAvailableRooms, icon: <FaCheckCircle className={`text-3xl ${theme === "Dark" ? "text-lime-400" : "text-lime-600"}`} /> },
    { label: "Occupied", value: totalOccupiedRooms, icon: <FaUsers className={`text-3xl ${theme === "Dark" ? "text-red-400" : "text-red-600"}`} /> },
    { label: "Reserved", value: totalReservedRooms, icon: <FaCalendarCheck className={`text-3xl ${theme === "Dark" ? "text-sky-400" : "text-sky-500"}`} /> },
    { label: "Maintenance", value: totalMaintenanceRooms, icon: <FaTools className={`text-3xl ${theme === "Dark" ? "text-blue-400" : "text-blue-600"}`} /> },
  ];




  /// Modals
  // Add 
  const [itemName, setItemName] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [itemStock, setItemStock] = useState('')
  const [ItemCategory, setItemCategory] = useState('')

  const [occupied, setOccupied] = useState("");
  const [reserved, setReserved] = useState("");
  const [maintenanceRooms, setMaintenanceRooms] = useState("");

  const [catName, setCatName] = useState('')

  const [roomModal, setRoomModal] = useState(false)
  const [reserveModal, setReserveModal] = useState(false)
  const [checklistModal, setChecklistModal] = useState(false)
  const [catModal, setCatModal] = useState(false);
  const [catManageModal, setCatManageModal] = useState(false);

  const roomModalFun = () => {
    setItemName('')
    setItemPrice('')
    setItemStock('')
    setItemCategory('')
    setMaintenanceRooms('')


    setRoomModal(false)
  }



  const catModalFun = () => {
    setCatName('')
    setCatModal(false);
  }

  const catManageModalFun = () => {

    setCatManageModal(false);
  }

  const roomModalFunBtn = () => setRoomModal(true)
  const catModalFunBtn = () => setCatModal(true);



  /// Edit
  const [roomModalEdit, setRoomModalEdit] = useState(false)
  const [catModalEdit, setCatModalEdit] = useState(false);

  const roomModalFunEdit = () => {
    setItemName('')
    setItemPrice('')
    setItemStock('')
    setItemCategory('')
    setOccupied('')
    setReserved('')

    setRoomModalEdit(false)

  }
  const catModalFunEdit = () => {
    setCatName('')
    setCatModalEdit(false);
  }

  const roomModalFunBtnEdit = () => setRoomModalEdit(true)
  const catModalFunBtnEdit = () => setCatModalEdit(true);


  //// Delete 
  const [roomModalDelete, setRoomModalDelete] = useState(false)
  const [catModalDelete, setCatModalDelete] = useState(false);

  const roomModalFunDelete = () => {
    setRoomModalEdit(false)
    setRoomModalDelete(false)

  }
  const catModalFunDelete = () => setCatModalDelete(false);

  const roomModalFunBtnDelete = () => setRoomModalDelete(true)
  const catModalFunBtnDelete = () => setCatModalDelete(true);


  //// Auto Categories Modal
  const [addCatModalsuccess, setAddCatsuccess] = useState(false);
  const [addCatModalFail, setAddCatFail] = useState(false);
  const [addCatModalFailBlank, setAddCatFailBlank] = useState(false);

  const [editCatModalsuccess, setEditCatsuccess] = useState(false);
  const [editCatModalFail, setEditCatFail] = useState(false);

  const [deleteCatModalsuccess, setDeleteCatsuccess] = useState(false);
  const [deleteCatModalFail, setDeleteCatFail] = useState(false);

  const addCatsuccessFun = () => {
    setAddCatsuccess(true);
    setTimeout(() => setAddCatsuccess(false), 1500);
  };

  const addCatFailFun = () => {
    setAddCatFail(true);
    setTimeout(() => setAddCatFail(false), 1500);
  };

  const addCatFailBlankFun = () => {
    setAddCatFailBlank(true);
    setTimeout(() => setAddCatFailBlank(false), 1500);
  };

  const editCatsuccessFun = () => {
    setEditCatsuccess(true);
    setTimeout(() => setEditCatsuccess(false), 1500);
  };

  const editCatFailFun = () => {
    setEditCatFail(true);
    setTimeout(() => setEditCatFail(false), 1500);
  };

  const deleteCatsuccessFun = () => {
    setDeleteCatsuccess(true);
    setTimeout(() => setDeleteCatsuccess(false), 1500);
  };

  const deleteCatFailFun = () => {
    setDeleteCatFail(true);
    setTimeout(() => setDeleteCatFail(false), 1500);
  };



  const addCategory = async () => {

    if (Id) {

      if (catName) {
        try {
          const dbRef = ref(db, `web/pos/${Id}/roomcategories/`);

          const newbranchRef = push(dbRef, {

            Name: catName,

          });
          const newCreditKey = newbranchRef.key;

          const logRef = ref(db, `web/pos/${Id}/roomedit`);
          const newLogRef = push(logRef);
          await set(newLogRef, {
            type: "add",
            itemName: catName,
            itemId: newCreditKey,
            editedBy: userAccountName,
            timestamp: Date.now(),
            details: {
              Name: itemName,
              Price: itemPrice,
              Stock: itemStock,
              Category: ItemCategory,

            }
          });

          catModalFun()
          addCatsuccessFun()
        }
        catch {
          console.log('did not add category')
          catModalFunEdit()
          addCatFailFun()
        }
      }
      else {
        catModalFunEdit()
        addCatFailBlankFun()
      }

    }

  };


  const [catDeleteID, setCatDeleteId] = useState()
  const [catdeleteName, setCatDeleteName] = useState()

  const catDeletesetID = (id, jina) => {

    catModalFunBtnDelete()
    setCatDeleteId(id)
    setCatDeleteName(jina)
  }

  const deleteCategory = async () => {

    if (Id) {

      const logRef = ref(db, `web/pos/${Id}/roomedit`);
      const newLogRef = push(logRef);
      set(newLogRef, {
        type: "delete",
        itemName: catdeleteName,
        deletedBy: userAccountName,
        timestamp: Date.now(),
      });

      if (categoriesTotal == 1) {

        remove(ref(db, `web/pos/${Id}/roomcategories`)).then(() => {

          useUserRoomCategories.setState({ userRoomCategories: null });
          useUserRoomCategoriesTotal.setState({ userRoomCategoriesTotal: null });
          catModalFunDelete()
          deleteCatsuccessFun()

        })
          .catch((error) => {
            catModalFunDelete()
            deleteCatFailFun()
          });

      } else {
        remove(ref(db, `web/pos/${Id}/roomcategories/${catDeleteID}`)).then(() => {
          catModalFunDelete()
          deleteCatsuccessFun()

        })
          .catch((error) => {
            catModalFunDelete()
            deleteCatFailFun()
          });
      }
    }
  };

  const [catEditID, setCatEditId] = useState()

  const catEditsetID = (id, jina) => {

    catModalFunBtnEdit()
    setCatEditId(id)
    setCatName(jina)
  }

  const editCategories = async (id) => {

    if (Id) {

      if (catName) {

        try {

          const dbRef = ref(db, `web/pos/${Id}/roomcategories/${catEditID}`);
          const newbranchRef = update(dbRef, {

            Name: catName,

          });

          const newCreditKey = newbranchRef.key;

          // Get changes
          const changes = getChangedDetails();
          setChangeDetails(changes);

          // Save log
          const logRef = ref(db, `web/pos/${Id}/roomedit`);
          const newLogRef = push(logRef); // generates unique key
          await set(newLogRef, {
            type: "edit",
            itemName: catName,
            changes: changes,
            editedBy: userAccountName,
            timestamp: Date.now(),
          });

          catModalFunEdit()
          editCatsuccessFun()

        }
        catch {
          console.log('did not edit category')
          catModalFunEdit()
          editCatFailFun()
        }
      }
      else {
        catModalFunEdit()
        addCatFailBlankFun()
      }
    }
  };



  //// Auto Items modals
  const [addItemModalsuccess, setAddItemsuccess] = useState(false);
  const [addItemModalFail, setAddItemFail] = useState(false);
  const [addItemModalFailBlank, setAddItemFailBlank] = useState(false);

  const [editItemModalsuccess, setEditItemsuccess] = useState(false);
  const [editItemModalFail, setEditItemFail] = useState(false);

  const [deleteItemModalsuccess, setDeleteItemsuccess] = useState(false);
  const [deleteItemModalFail, setDeleteItemFail] = useState(false);


  const addItemsuccessFun = () => {
    setAddItemsuccess(true);
    setTimeout(() => setAddItemsuccess(false), 1500);
  };

  const addItemFailFun = () => {
    setAddItemFail(true);
    setTimeout(() => setAddItemFail(false), 1500);
  };

  const addItemFailBlankFun = () => {
    setAddItemFailBlank(true);
    setTimeout(() => setAddItemFailBlank(false), 1500);
  };

  const editItemsuccessFun = () => {
    setEditItemsuccess(true);
    setTimeout(() => setEditItemsuccess(false), 1500);
  };

  const editItemFailFun = () => {
    setEditItemFail(true);
    setTimeout(() => setEditItemFail(false), 1500);
  };

  const deleteItemsuccessFun = () => {
    setDeleteItemsuccess(true);
    setTimeout(() => setDeleteItemsuccess(false), 1500);
  };

  const deleteItemFailFun = () => {
    setDeleteItemFail(true);
    setTimeout(() => setDeleteItemFail(false), 1500);
  };



  ////// Handlers for room operations

  const addItem = async () => {
    if (!Id) return;

    if (itemName && ItemCategory) {
      try {

        const dbRef = ref(db, `web/pos/${Id}/room/`);

        const newItemRef = push(dbRef, {
          Name: itemName,
          Price: itemPrice,
          Category: "Accommodation",
          RoomCategory: ItemCategory,
          Stock: itemStock,
          Occupied: "0",
          Reserved: "0",
          Maintenance: "0",
        });

        const newItemKey = newItemRef.key;

        // LOG
        const logRef = ref(db, `web/pos/${Id}/roomedit`);
        const newLogRef = push(logRef);

        await set(newLogRef, {
          type: "add",
          itemName: itemName,
          itemId: newItemKey,
          editedBy: userAccountName,
          timestamp: Date.now(),
          details: {
            Name: itemName,
            Price: itemPrice,
            Category: "Accommodation",
            RoomCategory: ItemCategory,
            Available: itemStock,
            Occupied: "0",
            Reserved: "0",
            Maintenance: "0"
          }
        });

        roomModalFun();
        addItemsuccessFun();

      } catch (error) {

        console.log("did not add room", error);

        roomModalFun();
        addItemFailFun();
      }

    } else {

      roomModalFun();
      addItemFailBlankFun();

    }
  };



  //// ROOM EDIT ID
  const [roomEditID, setRoomEditId] = useState();

  //// LOAD ROOM DATA INTO EDIT FORM
  const itemEditsetID = (
    id,
    jina,
    available,
    price,
    category,
    occupied,
    reserved,
    maintenance
  ) => {
    roomModalFunBtnEdit();
    setRoomEditId(id);
    // OLD VALUES
    setOldItem({
      Name: jina,
      Price: price,
      Stock: available,
      Category: category,
      Occupied: occupied,
      Reserved: reserved,
      Maintenance: maintenance
    });

    // FORM VALUES
    setItemName(jina);
    setItemPrice(price);
    setItemStock(available);
    setItemCategory(category);
    setOccupied(occupied);
    setReserved(reserved);
    setMaintenanceRooms(maintenance);
  };



  //// STORE CHANGE DETAILS
  const [changeDetails, setChangeDetails] = useState([]);

  const getChangedDetails = () => {

    let changes = [];

    if (oldItem.Name !== itemName) {
      changes.push(`Name changed from "${oldItem.Name}" → "${itemName}"`);
    }

    if (oldItem.Category !== ItemCategory) {
      changes.push(`Category changed from "${oldItem.Category}" → "${ItemCategory}"`);
    }

    if (oldItem.Price !== itemPrice) {

      const diff = itemPrice - oldItem.Price;

      const diffText =
        diff > 0
          ? `increased by ${diff}`
          : `decreased by ${Math.abs(diff)}`;

      changes.push(`Price changed: ${oldItem.Price} → ${itemPrice} (${diffText})`);
    }


    if (oldItem.Stock !== itemStock) {

      console.log("olditem", oldItem)

      const diff = itemStock - oldItem.Stock;

      const diffText =
        diff > 0
          ? `increased by ${diff}`
          : `decreased by ${Math.abs(diff)}`;

      changes.push(
        `Available rooms changed: ${oldItem.Stock} → ${itemStock} (${diffText})`
      );
    }


    if (oldItem.Maintenance !== maintenanceRooms) {

      const diff = maintenanceRooms - oldItem.Maintenance;

      const diffText =
        diff > 0
          ? `increased by ${diff}`
          : `decreased by ${Math.abs(diff)}`;

      changes.push(
        `Maintenance rooms changed: ${oldItem.Maintenance} → ${maintenanceRooms} (${diffText})`
      );
    }

    return changes;

  };


  //// EDIT ROOM
  const editItem = async () => {

    if (!Id) return;

    try {

      const dbRef = ref(db, `web/pos/${Id}/room/${roomEditID}`);

      await update(dbRef, {
        Name: itemName,
        Price: itemPrice,
        RoomCategory: ItemCategory,
        Stock: itemStock,
      });

      const changes = getChangedDetails();

      setChangeDetails(changes);

      // LOG EDIT
      const logRef = ref(db, `web/pos/${Id}/roomedit`);
      const newLogRef = push(logRef);

      await set(newLogRef, {
        type: "edit",
        itemName: itemName,
        changes: changes,
        editedBy: userAccountName,
        timestamp: Date.now(),
      });

      roomModalFunEdit();
      editItemsuccessFun();

    } catch (error) {

      console.log("Did not edit Room", error);

      roomModalFunEdit();
      editItemFailFun();

    }

  };

  const updateMaintenance = async () => {
    if (!Id) return;

    const newMaintenanceValue = parseInt(maintenanceRooms);
    const currentStock = parseInt(oldItem.Stock);
    const currentMaintenance = parseInt(oldItem.Maintenance);

    let newStock = currentStock;
    let newMaintenance = currentMaintenance;

    // Calculate difference
    const diff = newMaintenanceValue - currentMaintenance;

    if (diff > 0 && diff > currentStock) {
      //   alert("You cannot maintain more rooms than available stock");
      ticketSuccess() //// modal function  is not for Success  by Kodder kod
      return;
    }

    // Update stock and maintenance based on diff
    if (diff > 0) {
      // Moving rooms to maintenance → reduce stock
      newStock = currentStock - diff;
      newMaintenance = currentMaintenance + diff;
    } else if (diff < 0) {
      // Reducing maintenance → restore stock
      const restore = Math.abs(diff);
      newStock = currentStock + restore;
      newMaintenance = currentMaintenance - restore;
    } else {
      //   alert("No changes detected in maintenance");
      ticketFail()
      return;
    }

    // Temporary object to pass to getChangedDetails
    const tempItem = {
      ...oldItem,
      Stock: newStock,
      Maintenance: newMaintenance,
    };

    // Compute changes exactly like editItem
    const changes = [];
    if (oldItem.Stock !== tempItem.Stock) {
      const diffStock = tempItem.Stock - oldItem.Stock;
      const diffText = diffStock > 0 ? `increased by ${diffStock}` : `decreased by ${Math.abs(diffStock)}`;
      changes.push(`Available rooms changed: ${oldItem.Stock} → ${tempItem.Stock} (${diffText})`);
    }

    if (oldItem.Maintenance !== tempItem.Maintenance) {
      const diffMaint = tempItem.Maintenance - oldItem.Maintenance;
      const diffText = diffMaint > 0 ? `increased by ${diffMaint}` : `decreased by ${Math.abs(diffMaint)}`;
      changes.push(`Maintenance rooms changed: ${oldItem.Maintenance} → ${tempItem.Maintenance} (${diffText})`);
    }

    try {
      const dbRef = ref(db, `web/pos/${Id}/room/${roomEditID}`);
      await update(dbRef, {
        Stock: newStock,
        Maintenance: newMaintenance,
      });

      const logRef = ref(db, `web/pos/${Id}/roomedit`);
      const newLogRef = push(logRef);
      await set(newLogRef, {
        type: "maintenance",
        itemName: oldItem.Name,
        changes: changes,
        editedBy: userAccountName,
        timestamp: Date.now(),
      });

      // Update modal changes
      setChangeDetails(changes);

      roomModalFunEdit();
      editItemsuccessFun();

    } catch (error) {
      console.log("Maintenance update failed", error);
      editItemFailFun();
    }
  };


  const [roomdeleteID, setRoomDeleteId] = useState()
  const [roomdeleteName, setRoomDeleteName] = useState()

  const roomDeletesetID = (id, jina) => {

    roomModalFunBtnDelete()
    setRoomDeleteId(id)
    setRoomDeleteName(jina)
  }


  const deleteItem = async () => {
    if (!Id) return;

    try {

      // Save log first
      const logRef = ref(db, `web/pos/${Id}/roomedit`);
      const newLogRef = push(logRef);
      await set(newLogRef, {
        type: "delete",
        itemName: roomdeleteName,
        deletedBy: userAccountName,
        timestamp: Date.now(),
      });


      // Now delete the room
      if (roomTotal === 1) {
        await remove(ref(db, `web/pos/${Id}/room/`));
        useUserRoom.setState({ userRoom: null });
        useUserRoomTotal.setState({ userRoomTotal: null });
      } else {
        await remove(ref(db, `web/pos/${Id}/room/${roomdeleteID}`));

      }

      roomModalFunDelete();
      deleteItemsuccessFun();

    } catch (error) {
      console.log("did not delete room", error);
      roomModalFunDelete();
      deleteItemFailFun();
    }
  };


  const [reservedCheckoutModal, setReservedCheckoutModal] = useState(false);

  const reservedCheckoutModalFun = () => {
    // Clear all form values
    setClientName("");
    setClientPhone("");
    setClientIdNumber("");
    setNumberOfPeople("");
    setReservationDate("");
    setDuration("1");

    // Clear all errors
    setClientNameError("");
    setReservationDateError("");
    setDurationError("");

    // Clear employee selection
    setSelectEmployee("");

    // Close modal
    setReservedCheckoutModal(false);
  };


  const [roomNumber, setRoomNumber] = useState("");
  const [roomStatus, setRoomStatus] = useState("available");
  const [maintenanceNote, setMaintenanceNote] = useState("");


  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");

  const [clientNameError, setClientNameError] = useState("");

  const [totalError, setTotalError] = useState("");


  const [reservationDateError, setReservationDateError] = useState("");
  const [durationError, setDurationError] = useState("");


  const [roomMode, setRoomMode] = useState("normal");


  const [selectedCashier, setSelectedCashier] = useState("");


  const [deleteId, setDeleteId] = useState()



  const [cart1, setCart1] = useState([]);


  const [total1, setTotal1] = useState(0);



  const [totalItems1, setTotalItems] = useState(0);

  const [totalQty1, setTotalQty] = useState(0);

  const [totalWeight1, setTotalWeight] = useState(0);

  const [vatBreakdown1, setVatBreakdown] = useState(0);


  const [clientName1, setClientName1] = useState("");
  const [clientPhone1, setClientPhone1] = useState("");
  const [clientIdNumber1, setClientIdNumber1] = useState("");
  const [numberOfPeople1, setNumberOfPeople1] = useState("");



  const handleTicketClick = (
    id,
    cartItems,
    cashier,
    cashSale,
    timestamp,       // renamed from date
    totalAmount,     // renamed from total
    clientName,
    clientPhone,
    clientIdNumber,
    numberOfPeople
  ) => {
    // Set basic cart info
    setCart1(cartItems);
    setDeleteId(id);
    setSelectedCashier(cashier);
    setReceiptNumber(cashSale);
    setTotal1(totalAmount);

    // Set client info
    setClientName1(clientName);
    setClientPhone1(clientPhone);
    setClientIdNumber1(clientIdNumber);
    setNumberOfPeople1(numberOfPeople);

    console.log("total ticket", totalAmount);

    // Totals
    setTotalItems(cartItems.length);
    setTotalQty(
      cartItems.reduce((sum, item) => sum + (parseInt(item.stock) || 0), 0)
    );
    setTotalWeight(
      cartItems.reduce(
        (sum, item) =>
          sum + (parseFloat(item.Weight || 0) * (parseInt(item.stock) || 0)),
        0
      )
    );

    // VAT breakdown
    const vatData = {
      A: { vatable: 0, vat: 0 },
      E: { vatable: 0, vat: 0 },
      Z: { vatable: 0, vat: 0 },
    };

    cartItems.forEach((item) => {
      const code = item.VatCode || "A";
      const qty = parseFloat(item.stock) || 0;
      const price = parseFloat(item.Price) || 0;
      const total = qty * price;

      if (code === "A") {
        const vat = total * 0.16 / 1.16;
        vatData.A.vat += vat;
        vatData.A.vatable += total;
      } else if (code === "E") {
        vatData.E.vatable += total;
      } else if (code === "Z") {
        vatData.Z.vatable += total;
      }
    });

    setVatBreakdown(vatData);

    // Date and time (safe)
    const jsDate = timestamp ? new Date(Number(timestamp)) : new Date();

    const dateOnly = jsDate.toLocaleDateString("en-GB"); // dd/mm/yyyy
    const timeOnly = jsDate.toLocaleTimeString("en-GB", { hour12: false }); // hh:mm:ss

    setSelectedDate(dateOnly);
    setSelectedTime(timeOnly);
  };




  const handleCheckout = (res) => {

    const pop1 = handleTicketClick(res.id, res.Cart, res.EmployeeID, res.CashSale, res.Date, res.Total)

    const people = handleSend1(res.id, res.Cart, res.EmployeeID, res.CashSale, res.Date, res.Total, res.ClientName, res.ClientPhone, res.NumberOfPeople, res.ClientIdNumber)

  }

  const handleSend1 = (idd, cart22, employee, cashsale, date, idadi, client, phone, pple, clientId) => {

    if (Id) {

      if (employee) {

        if (idadi == 0) {
          console.log("total is zero")
          sendModalFun()
          sendFail()
        }

        else {
          try {

            const peopleCount = Number(pple);

            const safePeople =
              pple && !isNaN(peopleCount)
                ? peopleCount
                : null;

            const hexTicket = generateRandomHex();

            const dbRef = ref(db, `web/pos/${Id}/checkoutlist/`);

            const newbranchRef = push(dbRef, {
              EmployeeID: employee,
              CashSale: cashsale,
              Cart: cart22,
              Total: idadi,
              Date: date || Date.now(),
              ClientID: clientId?.trim() || "",
              ClientName: client?.trim() || "",
              ClientPhone: phone?.trim() || "",
              NumberOfPeople: safePeople,
            });

            const jina = "checkout"

            sendModalFun()
            sendSuccess()

            updateStockInDatabase(Id, jina, cart22)

            deleteTicket(idd)

          }

          catch (error) {

            console.log(error)
            console.log("did not send to DB")

            sendModalFun()
            sendFail()

          }
        }

      }

      else {

        console.log("did not select employee")
        sendModalFun()

      }

    }

  };

  const deleteTicket = (deleteId1) => {
    if (Id) {

      if (reservationTotal == 1) {

        remove(ref(db, `web/pos/${Id}/reserved`)).then(() => {

          useUserReserved.setState({ userReserved: null });
          useUserReservedTotal.setState({ userReservedTotal: null });
          setDeleteId(null)

        })
          .catch((error) => {
            console.log("reservation was not deleted")
          });
      } else {
        remove(ref(db, `web/pos/${Id}/reserved/${deleteId1}`)).then(() => {
          console.log("reservation was deleted")
          setDeleteId(null)
          // hands()
        })
          .catch((error) => {
            console.log("reservation was not deleted")
          });
      }
    }
  }


  const handleCancelReserve = (res) => {
    const jina = "cancelReserve"

    updateStockInDatabase(Id, jina, res.Cart)

    deleteTicket(res.id)


  }


  const handleCancelCheckout = (res) => {
    const jina = "cancelCheckout"

    updateStockInDatabase(Id, jina, res.Cart)

    deleteCheckout(res.id)

  }



  const handleCart = (res) => {

    const pop1 = handleTicketClick(res.id, res.Cart, res.EmployeeID, res.CashSale, res.Date, res.Total)

    console.log("total", res.Total)

    const people = handleSend2(res.id, res.Cart, res.EmployeeID, res.CashSale, res.Date, res.Total, res.ClientName, res.ClientPhone, res.NumberOfPeople, res.ClientIdNumber)

  }

  const handleSend2 = (idd, cart22, employee, cashsale, date, idadi, client, phone, pple, clientId) => {

    if (Id) {

      if (employee) {

        if (idadi == 0) {
          console.log("total is zero")
          sendModalFun()
          sendFail()
        }

        else {
          try {
            const peopleCount = Number(pple);

            const safePeople =
              pple && !isNaN(peopleCount)
                ? peopleCount
                : null;

            const hexTicket = generateRandomHex();

            const dbRef = ref(db, `web/pos/${Id}/cart/`);

            const newbranchRef = push(dbRef, {
              EmployeeID: employee,
              CashSale: cashsale,
              Cart: cart22,
              Total: idadi,
              Date: date || Date.now(),
              ClientID: clientId?.trim() || "",
              ClientName: client?.trim() || "",
              ClientPhone: phone?.trim() || "",
              NumberOfPeople: safePeople,
            });

            const jina = "cart"

            sendModalFun()
            sendSuccess()

            updateStockInDatabase(Id, jina, cart22)

            deleteCheckout(idd)


          }

          catch (error) {

            console.log(error)
            console.log("did not send to DB")

            sendModalFun()
            sendFail()

          }
        }
      }
      else {

        console.log("did not select employee")
        sendModalFun()
      }
    }
  };


  const deleteCheckout = (deleteId1) => {
    if (Id) {

      if (checkoutlistTotal == 1) {

        remove(ref(db, `web/pos/${Id}/checkoutlist`)).then(() => {

          useUserCheckoutList.setState({ userCheckoutList: null });
          useUserCheckoutListTotal.setState({ userCheckoutListTotal: null });
          setDeleteId(null)

        })
          .catch((error) => {
            console.log("checkout was not deleted")
          });
      } else {
        remove(ref(db, `web/pos/${Id}/checkoutlist/${deleteId1}`)).then(() => {

          console.log("checkout was deleted")
          setDeleteId(null)

        })
          .catch((error) => {

            console.log("checkout was not deleted")
          });
      }
    }
  }



  return (

    <div className={`min-h-screen flex flex-col"
    ${theme === "Dark"
        ? "text-white "
        : "bg-gray-200 text-black rounded-lg"
      }`}
    >

      {/* Main Layout */}

      {!receiptModal && (

        <>
          <div className="flex flex-col md:flex-row flex-grow rounded  ">
            <div
              className={`p-4 rounded-xl shadow-md md:hidden
    ${theme === "Dark" ? "bg-[#1f214f]" : "bg-white"}
  `}
            >

              <h3 className="text-sm sm:text-lg font-bold mb-3">
                Summary for Accommodation
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {reportData.map(({ label, value, icon, iconColor }) => (
                  <div
                    key={label}
                    className={`shadow p-3 sm:p-4 rounded-xl 
        flex flex-col sm:flex-row items-center gap-2 sm:gap-3
        ${theme === "Dark" ? "bg-[#132962]" : "bg-white"}
      `}
                  >
                    {/* Icon */}
                    <div
                      className={`flex items-center justify-center 
          w-8 h-8 sm:w-12 sm:h-12 
          rounded-full ${iconColor}`}
                    >
                      <span className="text-xs sm:text-lg text-white">
                        {icon}
                      </span>
                    </div>

                    {/* Text */}
                    <div className="text-center sm:text-left">
                      <h3 className="text-xs sm:text-sm font-semibold leading-tight">
                        {label}
                      </h3>
                      <p className="text-sm sm:text-xl font-bold">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>


              <h3 className="font-bold text-sm sm:text-lg m-4 ">
                Accommodation Management
              </h3>

              <div className="grid grid-cols-2 gap-5">
                {[
                  "Reserved ",
                  "Checkout Lists",
                  "Manage Categories",
                  "Add Room+",
                ].map((label, i) => {
                  const isAdd =
                    label === "Manage Categories" ||
                    label === "Add Room+";

                  return (
                    <button
                      key={i}
                      className={`py-4 px-3 text-xs rounded-lg
            ${isAdd
                          ? theme === "Dark"
                            ? "bg-green-800 text-white hover:bg-green-600"
                            : "bg-green-600 text-white hover:bg-green-800 shadow-lg"
                          : theme === "Dark"
                            ? "text-white bg-blue-800 hover:bg-blue-600"
                            : "bg-blue-600 text-white hover:bg-blue-800 shadow-lg"
                        }
          `}
                      onClick={() => setReceiptModal(true)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>


            {/* Items */}
            <section className="w-full md:w-2/3 p-4 rounded-lg h-screen overflow-y-auto ">

              <h3 className="text-sm sm:text-lg font-bold mb-3  hidden md:block ">
                Summary for Accommodation
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 hidden md:grid ">
                {reportData.map(({ label, value, icon, iconColor }) => (
                  <div
                    key={label}
                    className={`shadow p-3 sm:p-4 rounded-xl 
        flex flex-col sm:flex-row items-center gap-2 sm:gap-3
        ${theme === "Dark" ? "bg-[#132962]" : "bg-white"}
      `}
                  >
                    {/* Icon */}
                    <div
                      className={`flex items-center justify-center 
          w-8 h-8 sm:w-12 sm:h-12 
          rounded-full ${iconColor}`}
                    >
                      <span className="text-xs sm:text-lg text-white">
                        {icon}
                      </span>
                    </div>

                    {/* Text */}
                    <div className="text-center sm:text-left">
                      <h3 className="text-xs sm:text-sm font-semibold leading-tight">
                        {label}
                      </h3>
                      <p className="text-sm sm:text-xl font-bold">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Title + Search */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">

                <h3 className="text-sm sm:text-lg font-bold">
                  Accommodation in {selectedCategory}
                </h3>

                <input
                  type="text"
                  placeholder="Search items..."
                  className={`w-full md:w-auto p-2 rounded-xl text-xs sm:text-sm border outline-none
          ${theme === "Dark"
                      ? "bg-[#1e3a8a] text-white border-blue-700 placeholder-gray-300"
                      : "bg-white text-black border-gray-300 placeholder-gray-500"
                    }`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

              </div>

              <div className="w-full flex flex-col items-center">
                {/* Title */}
                <div className="text-sm font-semibold mb-2 text-center">
                  Select Category
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap justify-center items-center gap-2 mb-2">
              {categories && categories.map((category) => (
  <button
    key={category.id}
    className={`font-bold py-1 px-3 rounded-xl text-xs my-1 sm:text-sm
      transition-all duration-200
      ${selectedCategory === category.Name
        ? 'bg-blue-600 text-white shadow-md'
        : theme === "Dark"
          ? "bg-gray-700 text-white"
          : "bg-white text-gray-800 border border-gray-300 shadow-sm hover:shadow-md hover:bg-gray-100"
      }`}
    onClick={() => 
      setSelectedCategory(
        selectedCategory === category.Name ? "" : category.Name
      )
    }
  >
    {category.Name}
  </button>
))}
                </div>
              </div>


              {filteredItems && (

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 sm:gap-4 gap-2 overflow-y-auto">
                  {sortedItems.map((item, index) => {
                    const outOfStock = item.Stock == 0;

                    return (

                      <div
                        key={index}
                        onClick={() => addToCart(item)}
                        className={`
          rounded-xl shadow-lg p-3 sm:p-4 flex flex-col justify-between
          cursor-pointer
          transition hover:scale-[1.01]
          ${theme === "Dark"
                            ? "bg-[#132962] text-white"
                            : "bg-white text-gray-800"}
        `}
                      >

                        {/* HEADER */}
                        <div className="flex justify-between items-start">

                          {/* Left: Name + Category */}
                          <div>
                            <h3 className="font-semibold text-sm sm:text-base">
                              {item.Name}
                            </h3>

                            <span
                              className={`text-[11px] px-2 py-[2px] rounded-md font-medium mt-1 inline-block
        ${theme === "Dark"
                                  ? "bg-[#1f2250] text-gray-300"
                                  : "bg-gray-200 text-gray-700"}
      `}
                            >
                              {item.RoomCategory || "Uncategorized"}
                            </span>
                          </div>

                          {/* Right: Price */}
                          <div className="text-right">
                            <p className="text-sm sm:text-lg font-semibold text-black">
                              KES {parseInt(item.Price).toLocaleString()}
                            </p>
                          </div>

                        </div>
                        {/* STATS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs mt-2">
                          <div className="flex justify-between items-center">
                            <span>Available</span>
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-600 text-white font-bold ">
                              {item.Stock}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span>Occupied</span>
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-600 text-white font-bold">
                              {item.Occupied || 0}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span>Reserved</span>
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-yellow-400 text-black font-bold">
                              {item.Reserved || 0}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span>Maintenance</span>
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                              {item.Maintenance || 0}
                            </span>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-end  items-center mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              itemEditsetID(item.id, item.Name, item.Stock, item.Price, item.RoomCategory, item.Occupied, item.Reserved, item.Maintenance)
                            }}
                            className="py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm"
                          >
                            Manage
                          </button>
                        </div>
                      </div>

                    );
                  })}
                </div>

              )}

              {!filteredItems && (
                <div>
                  <div className="justify-center flex mt-20">
                    <FaBoxOpen className={`text-4xl ${theme === "Dark" ? "text-white" : "text-black"}`} />
                  </div>
                  <div className="justify-center flex">
                    <h1 className="text-md  sm:text-xl mt-2">No Items in the Inventory</h1>
                  </div>
                </div>
              )}
            </section>

            {/* Cart */}
            <section
              id="cart-section"
              className={`w-full md:w-1/3 p-4 rounded-xl flex flex-col gap-4 
    ${theme === "Dark" ? "text-white" : "bg-gray-200"}
  `}
            >
              {/* ===== TOP: ACCOMMODATION MANAGEMENT ===== */}
              <div
                className={`p-4 rounded-xl shadow-md hidden md:block 
    ${theme === "Dark" ? "bg-[#1f214f]" : "bg-white"}
  `}
              >
                <h3 className="font-bold text-sm sm:text-lg mb-3">
                  Accommodation Management
                </h3>
                <div className="grid grid-cols-2 gap-5">
                  {[
                    "Reserved ",
                    "Checkout Lists",
                    "Manage Categories",
                    "Add Room+",
                  ].map((label, i) => {
                    const isAdd =
                      label === "Manage Categories" ||
                      label === "Add Room+";

                    // function handler for each button
                    const handleClick = () => {
                      switch (label) {
                        case "Reserved ":
                          setReserveModal(true);
                          break;

                        case "Checkout Lists":
                          setChecklistModal(true);
                          break;

                        case "Manage Categories":
                          setCatManageModal(true);
                          break;

                        case "Add Room+":
                          setRoomModal(true);
                          break;

                        default:
                          break;
                      }
                    };

                    return (
                      <button
                        key={i}
                        className={`py-3 text-xs sm:text-base rounded-lg font-semibold transition duration-200
        ${isAdd
                            ? theme === "Dark"
                              ? "bg-green-800 text-white hover:bg-green-600"
                              : "bg-green-600 text-white hover:bg-green-800 shadow-lg"
                            : theme === "Dark"
                              ? "bg-blue-800 text-white hover:bg-blue-600"
                              : "bg-blue-600 text-white hover:bg-blue-800 shadow-lg"
                          }`}
                        onClick={handleClick}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>


              {/* ===== BOTTOM: CART ===== */}
              <div
                className={` p-4 rounded-xl shadow-md flex flex-col 
      ${theme === "Dark" ? "bg-[#171941]" : "bg-white"}
    `}
              >

                <h3 className="text-sm sm:text-lg font-bold mb-3">Checkout Menu</h3>
                {/* Header */}
                <div
                  className={`flex justify-between font-bold p-2 rounded mb-2 text-xs sm:text-sm
        ${theme === "Dark" ? "bg-blue-800" : "bg-blue-600 text-white"}
      `}
                >
                  <div className="w-1/10 text-center">Unit</div>
                  <div className="w-2/5 text-center">Name</div>
                  <div className="w-1/5 text-center">Price</div>
                  <div className="w-1/5 text-center">Actions</div>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto max-h-72">
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-2 rounded-md mb-2 text-xs sm:text-sm
            ${theme === "Dark" ? "" : "bg-gray-100 shadow"}
          `}>
                      <div className="w-1/10 text-center">{item.stock}</div>
                      <div className="w-2/5 text-center">{item.Name}</div>
                      <div className="w-1/5 text-center">
                        {(parseInt(item.stock) * parseInt(item.Price)).toLocaleString()}
                      </div>


                      <div className="w-3/10 flex justify-between">
                        <button
                          className={`py-0 px-3 rounded
                ${theme === "Dark"
                              ? "bg-green-800 hover:bg-green-600"
                              : "bg-green-600 text-white hover:bg-green-800"
                            }`}
                          onClick={() => handleIncrease(item)}
                        >
                          +
                        </button>
                        <button
                          className={`py-0 px-3 rounded sm:mx-3 mx-1
                ${theme === "Dark"
                              ? "bg-yellow-800 hover:bg-yellow-600"
                              : "bg-yellow-400 text-black hover:bg-yellow-700"
                            }`}
                          onClick={() => handleDecrease(item)}
                        >
                          -
                        </button>
                        <button
                          className={`py-0 px-3 rounded
                ${theme === "Dark"
                              ? "bg-red-800 hover:bg-red-600"
                              : "bg-red-600 text-white hover:bg-red-800"
                            }`}
                          onClick={() => handleRemove(item)}
                        >
                          X
                        </button>
                      </div>


                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-3 font-bold text-md sm:text-lg">
                  Total: Ksh {parseInt(total).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>


                {/* Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 ">
                  <button
                    className={`py-2 px-3 rounded text-xs sm:text-sm w-full
      ${theme === "Dark"
                        ? "bg-blue-800 hover:bg-blue-600"
                        : "bg-blue-600 text-white hover:bg-blue-800 shadow-lg"
                      }`}
                    onClick={() => setReservedCheckoutModal(true)}
                  >
                    Reserve
                  </button>

                  <button
                    className={`py-2 px-3 rounded  text-xs sm:text-sm  w-full
      ${theme === "Dark"
                        ? "bg-green-800 hover:bg-green-600"
                        : "bg-green-600 text-white hover:bg-green-800 shadow-lg"
                      }`}
                    onClick={() => setSendModal(true)}
                  >
                    CheckOut
                  </button>

                  <button
                    className={`py-2 px-3 rounded  text-xs sm:text-sm  w-full
      ${theme === "Dark"
                        ? "bg-yellow-800 hover:bg-yellow-600"
                        : "bg-yellow-500 text-white hover:bg-yellow-800 shadow-lg"
                      }`}
                    onClick={() => setTicketModal(true)}
                  >
                    Guest
                  </button>

                  <button
                    className={`py-2 px-3 rounded  text-xs sm:text-sm  w-full
      ${theme === "Dark"
                        ? "bg-red-800 hover:bg-red-600"
                        : "bg-red-600 text-white hover:bg-red-800 shadow-lg"
                      }`}
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </section>
          </div>
          {/* Mobile Go To Cart Button */}
          <button
            onClick={() =>
              document
                .getElementById("cart-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className={`fixed bottom-1 right-4 z-50 md:hidden
    flex items-center gap-2 px-3 py-3 rounded-full shadow-lg text-sm
    ${theme === "Dark"
                ? "bg-white text-black border-black border-1"
                : "bg-white text-black border-black border-1"}
  `}
          >
            🛒 Cart
            {cart.length > 0 && (
              <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            )}
          </button>
        </>
      )}

      {/* Modals section */}

      {roomModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <div
            className={`p-6 rounded-xl shadow-lg w-96 mx-4
        ${theme === "Dark" ? "bg-[#171941]" : "bg-white"}
      `}
          >
            <h2 className="text-md sm:text-lg font-bold mb-5 text-center">
              Add Room
            </h2>

            <div className="space-y-3">

              {/* ROOM NAME */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">
                  Room Name
                </label>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter Room name"
                    className="w-full p-3 border border-gray-300 rounded shadow-md pl-10 text-black"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />

                  <FaTags className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                </div>
              </div>



              {/* CATEGORY */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">
                  Category
                </label>

                <select
                  className="w-full p-3 border border-gray-300 rounded shadow-md text-black"
                  value={ItemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                >
                  <option value="" disabled>
                    -- Select Category --
                  </option>

                  <option value="None">None</option>

                  {categories?.map((category) => (
                    <option key={category.id} value={category.Name}>
                      {category.Name}
                    </option>
                  ))}
                </select>
              </div>


              {/* PRICE */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">
                  Price
                </label>

                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter price"
                    className="w-full p-3 border border-gray-300 rounded shadow-md pl-10 text-black"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                  />

                  <FaDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                </div>
              </div>



              {/* STOCK */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">
                  Total number of rooms
                </label>

                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter number"
                    className="w-full p-3 border border-gray-300 rounded shadow-md pl-10 text-black"
                    value={itemStock}
                    onChange={(e) => setItemStock(e.target.value)}
                  />

                  <FaBoxOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                </div>
              </div>

            </div>


            {/* BUTTONS */}
            <div className="flex justify-evenly mt-6">

              <button
                className={`px-5 py-2 rounded text-white font-medium
            ${theme === "Dark"
                    ? "bg-green-700 hover:bg-green-600"
                    : "bg-green-600 hover:bg-green-700"}
          `}
                onClick={addItem}
              >
                Add
              </button>


              <button
                className={`px-5 py-2 rounded text-white font-medium
            ${theme === "Dark"
                    ? "bg-red-700 hover:bg-red-600"
                    : "bg-red-600 hover:bg-red-700"}
          `}
                onClick={roomModalFun}
              >
                Cancel
              </button>

            </div>

          </div>
        </div>
      )}


      {roomModalEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <div
            className={`p-6 rounded-xl shadow-lg w-96 mx-4
      ${theme === "Dark" ? "bg-[#171941]" : "bg-white"}`}
          >

            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm sm:text-lg font-bold">Manage Room</h3>

              <button
                className={`px-5 py-2 rounded-lg text-white font-medium
    ${theme === "Dark"
                    ? "bg-red-700 hover:bg-red-600"
                    : "bg-red-600 hover:bg-red-700"}`}
                onClick={() => roomDeletesetID(roomEditID, oldItem.Name)}
              >
                Delete
              </button>
            </div>


            {/* MODE SELECTOR */}
            <div className="flex justify-center gap-3 mb-4">

              <button
                onClick={() => setRoomMode("normal")}
                className={`px-3 py-2 rounded-lg text-xs
          ${roomMode === "normal"


                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 text-black"}`}
              >
                Normal
              </button>

              <button
                onClick={() => setRoomMode("maintenance")}
                className={`px-3 py-2 rounded-lg text-xs
          ${roomMode === "maintenance"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-black"}`}
              >
                Maintenance
              </button>

            </div>

            <div className="space-y-3">

              {/* NORMAL ROOM SECTION */}
              {roomMode !== "maintenance" && (
                <>

                  {/* ROOM NAME */}
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600">
                      Room Name
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter room name"
                        className="w-full p-3 border border-gray-300 rounded pl-10 shadow-md text-black"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                      />
                      <FaTags className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                    </div>
                  </div>

                  {/* CATEGORY */}
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600">
                      Category
                    </label>

                    <select
                      className="w-full p-3 border border-gray-300 rounded shadow-md text-black"
                      value={ItemCategory}
                      onChange={(e) => setItemCategory(e.target.value)}
                    >
                      <option value="" disabled>
                        -- Select Category --
                      </option>

                      <option value="None">None</option>

                      {categories?.map((category) => (
                        <option key={category.id} value={category.Name}>
                          {category.Name}
                        </option>
                      ))}
                    </select>
                  </div>


                  {/* PRICE */}
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600">
                      Price
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Enter price"
                        className="w-full p-3 border border-gray-300 rounded pl-10 shadow-md text-black"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                      />

                      <FaDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                    </div>
                  </div>


                  {/* TOTAL ROOMS */}
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600">
                      Total number of rooms
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Enter number"
                        className="w-full p-3 border border-gray-300 rounded pl-10 shadow-md text-black"
                        value={itemStock}
                        onChange={(e) => setItemStock(e.target.value)}
                      />

                      <FaBoxOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                    </div>
                  </div>

                </>
              )}



              {/* MAINTENANCE SECTION */}
              {roomMode === "maintenance" && (
                <div className="mt-4 space-y-4">

                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Rooms Under Maintenance
                    </label>

                    <div className="relative mt-2">
                      <input
                        type="number"
                        min="1"
                        max={oldItem?.Stock}
                        placeholder="Enter number of rooms"
                        className="w-full p-3 border border-gray-300 rounded pl-10 shadow-md text-sm text-black"
                        value={maintenanceRooms}
                        onChange={(e) => setMaintenanceRooms(e.target.value)}
                      />
                      <FaTools className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                    </div>
                  </div>

                </div>
              )}

            </div>


            {/* BUTTONS */}
            <div className="flex justify-evenly mt-6">

              {roomMode === "normal" && (
                <button
                  className={`px-5 py-2 rounded text-white font-medium
      ${theme === "Dark"
                      ? "bg-green-700 hover:bg-green-600"
                      : "bg-green-600 hover:bg-green-700"}`}
                  onClick={() => editItem()}
                >
                  Save
                </button>
              )}

              {roomMode === "maintenance" && (
                <button
                  className={`px-5 py-2 rounded text-white font-medium
      ${theme === "Dark"
                      ? "bg-blue-700 hover:bg-blue-600"
                      : "bg-blue-600 hover:bg-blue-700"}`}
                  onClick={() => updateMaintenance()}
                >
                  Send to Maintenance
                </button>
              )}


              <button
                className={`px-5 py-2 rounded text-white font-medium text-xs sm:text-base
          ${theme === "Dark"
                    ? "bg-red-800 hover:bg-red-600"
                    : "bg-red-600 hover:bg-red-800"}`}
                onClick={roomModalFunEdit}
              >
                Back
              </button>

            </div>

          </div>
        </div>
      )}


      {/* Rooms delete*/}
      {roomModalDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <div className={` p-6 rounded-xl shadow w-96  mx-4
                        ${theme === "Dark"
              ? " bg-[#171941] "
              : " bg-white "
            }`
          }>
            <h2 className="text-sm sm:text-lg font-bold mb-4 text-center">Delete Room</h2>

            <div className="mt-4 font-semibold text-sm sm:text-md">
              Are you sure you want to delete this Room ?
            </div>

            <div className=" flex flex-row justify-evenly">
              <button
                className={` text-white px-4 py-2 rounded  mt-4  text-sm sm:text-base
                                
                              ${theme === "Dark"
                    ? "bg-green-800  hover:bg-green-600"
                    : "bg-green-600  hover:bg-green-800 "
                  }`}
                onClick={() => deleteItem()}
              >
                Ok
              </button>
              <button
                className={` text-white px-4 py-2 rounded mt-4 text-sm sm:text-base
                                  ${theme === "Dark"
                    ? "bg-red-800  hover:bg-red-600"
                    : "bg-red-600  hover:bg-red-800 "
                  }`}
                onClick={() => roomModalFunDelete()}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}


      {reserveModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className={`p-6 rounded-xl shadow-lg w-[90%] max-w-7xl h-[90%] overflow-y-auto
        ${theme === "Dark" ? "bg-[#171941] text-white" : "bg-gray-100 text-black"}`}>

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-3">
              {/* Title */}
              <h2 className="text-sm sm:text-lg font-bold text-center flex-1">
                All Reservations
              </h2>

              {/* Back / Cancel Button */}
              <button
                className={`ml-4 px-4 py-1 rounded text-sm sm:text-base font-medium transition-colors
      ${theme === "Dark"
                    ? "bg-red-800 hover:bg-red-600 text-white"
                    : "bg-red-600 hover:bg-red-800 text-white"
                  }`}
                onClick={() => setReserveModal(false)}
              >
                Back
              </button>
            </div>

            {/* Reservations List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-5 lg:gap-10 gap-2">

              {reservation ? (
                [...reservation].reverse().map((res, index) => {
                  const total =
                    res.Cart?.reduce(
                      (acc, item) =>
                        acc + parseInt(item.Price) * parseInt(res.Duration),
                      0
                    ) || 0;
                  return (
                    <div
                      key={index}
                      className={`relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl border-l-4 
            ${theme === "Dark"
                          ? "bg-[#1A1D33] border-blue-500 text-white shadow-lg"
                          : "bg-white border-blue-600 text-slate-800 shadow-md"}
          `}
                    >
                      {/* Top Section: Price & Status Accent */}
                      <div className="p-4 pb-0 flex justify-between items-start">
                        <div className="space-y-1">

                          <h3 className="text-sm sm:text-lg  font-extrabold">{res.ClientName}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-sm sm:text-lg font-black text-green-500">
                            <span className='text-xs sm:text-md'>
                              KES
                            </span> {parseInt(res.Total) * Math.max(1, Math.round((Date.now() - res.Date) / (1000 * 60 * 60 * 24)))}
                          </p>  <p className="text-[10px] font-medium opacity-60 uppercase">Total Amount</p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="p-4 grid grid-cols-2 gap-2 border-b border-opacity-10 border-gray-500">
                        <div className="space-y-1">
                          <p className="sm:text-[11px] text-[9px]  uppercase opacity-50 font-bold">Contact</p>
                          <p className="text-xs sm:text-sm  font-medium">{res.ClientPhone || "N/A"}</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="sm:text-[11px] text-[9px]  uppercase opacity-50 font-bold">Date</p>
                          <p className="text-xs sm:text-sm font-medium">{res.ReservationDate}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="sm:text-[11px] text-[9px] uppercase opacity-50 font-bold">Guests</p>
                          <p className="text-xs sm:text-sm font-medium">{res.NumberOfPeople} People</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="sm:text-[11px] text-[9px] uppercase opacity-50 font-bold">Stay</p>
                          <p className="text-xs sm:text-sm font-medium font-mono bg-opacity-10 px-2 py-1 rounded bg-blue-500 inline-block">
                            {res.Duration} Days
                          </p>
                        </div>
                      </div>

                      {/* Items / Tags Area */}
                      <div className="px-6 py-2">
                        <div className="flex flex-wrap gap-2">
                          {res.Cart?.length > 0 ? (
                            res.Cart.map((item, i) => (
                              <span
                                key={i}
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-md border 
                      ${theme === "Dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50 text-gray-600"}`}
                              >
                                {item.stock} - {item.Name} @ KES {item.Price}/=
                              </span>
                            ))
                          ) : (
                            <span className="text-xs italic opacity-40">No items selected</span>
                          )}
                        </div>
                      </div>
                      {/* Modern Action Bar */}
                      <div className={`flex flex-row sm:flex-row p-2 gap-3 w-full`}>
                        {/* Receipt - Blue */}
                        <button
                          onClick={() => (
                            setReceiptModal(true), handleTicketClick(res.id, res.Cart, res.EmployeeID, res.CashSale, res.Date, res.Total))}
                          className={`py-2 px-3 rounded-lg text-xs sm:text-sm w-full
      ${theme === "Dark"
                              ? "bg-blue-800 hover:bg-blue-600"
                              : "bg-blue-600 text-white hover:bg-blue-800 shadow-lg"
                            }`}>
                          Receipt
                        </button>

                        {/* Confirm - Green */}
                        <button
                          onClick={() => {
                            setSelectedReservation(res);
                            setSendCheckoutModal(true);
                          }}
                          className={`py-2 px-3 rounded-lg  text-xs sm:text-sm  w-full
      ${theme === "Dark"
                              ? "bg-green-800 hover:bg-green-600"
                              : "bg-green-600 text-white hover:bg-green-800 shadow-lg"
                            }`} >
                          Confirm
                        </button>

                        {/* Cancel - Red */}
                        <button
                          onClick={() => {
                            setCancelCheckoutModal(true);
                            setSelectedReservation(res)
                          }

                          }
                          className={`py-2 px-3 rounded-lg  text-xs sm:text-sm  w-full
      ${theme === "Dark"
                              ? "bg-red-800 hover:bg-red-600"
                              : "bg-red-600 text-white hover:bg-red-800 shadow-lg"
                            }`}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-20 text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-xl font-light opacity-50">No reservations found in the system.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )
      }

      {
        sendCheckoutModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div
              className={`p-6 rounded-xl shadow w-96 mx-4
        ${theme === "Dark" ? "bg-[#171941]" : "bg-white"}
      `}
            >
              <h2 className="text-md sm:text-lg font-bold mb-4 text-center">
                Send To Checkout
              </h2>

              <div className="mt-4 font-bold text-sm sm:text-lg">
                Served by {userAccountName}
              </div>

              <div className="flex flex-row justify-evenly mt-4">

                <button
                  className={`text-white px-4 py-2 rounded text-xs sm:text-base
    ${theme === "Dark"
                      ? "bg-green-800 hover:bg-green-600"
                      : "bg-green-600 hover:bg-green-800"}
  `}
                  onClick={() => (handleCheckout(selectedReservation), setSendCheckoutModal(false))}
                >
                  Confirm
                </button>

                <button
                  className={`text-white px-4 py-2 rounded text-xs sm:text-base
            ${theme === "Dark"
                      ? "bg-red-800 hover:bg-red-600"
                      : "bg-red-600 hover:bg-red-800"}
          `}
                  onClick={() => (sendCheckoutModalFun())}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }

      {
        cancelCheckoutModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div
              className={`p-6 rounded-xl shadow w-96 mx-4
        ${theme === "Dark" ? "bg-[#171941]" : "bg-white"}
      `}
            >
              <h2 className="text-md sm:text-lg font-bold mb-4 text-center">
                Are you sure you want to cancel this reservation ??
              </h2>

              <div className="mt-4 font-bold text-sm sm:text-lg">
                Canceled by {userAccountName}
              </div>

              <div className="flex flex-row justify-evenly mt-4">

                <button
                  className={`text-white px-4 py-2 rounded text-xs sm:text-base
    ${theme === "Dark"
                      ? "bg-green-800 hover:bg-green-600"
                      : "bg-green-600 hover:bg-green-800"}
  `}
                  onClick={() => { handleCancelReserve(selectedReservation), setCancelCheckoutModal(false) }}
                >
                  Confirm
                </button>

                <button
                  className={`text-white px-4 py-2 rounded text-xs sm:text-base
            ${theme === "Dark"
                      ? "bg-red-800 hover:bg-red-600"
                      : "bg-red-600 hover:bg-red-800"}
          `}
                  onClick={() => (cancelCheckoutModalFun())}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }

      {
        checklistModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className={`p-6 rounded-xl shadow-lg w-[90%] max-w-7xl h-[90%] overflow-y-auto
        ${theme === "Dark" ? "bg-[#171941] text-white" : "bg-gray-100 text-black"}`}>

              {/* Modal Header */}
              <div className="flex justify-between items-center mb-3">
                {/* Title */}
                <h2 className="text-sm sm:text-lg font-bold text-center flex-1">
                  Checkout List
                </h2>

                {/* Back / Cancel Button */}
                <button
                  className={`ml-4 px-4 py-1 rounded text-sm sm:text-base font-medium transition-colors
      ${theme === "Dark"
                      ? "bg-red-800 hover:bg-red-600 text-white"
                      : "bg-red-600 hover:bg-red-800 text-white"
                    }`}
                  onClick={() => setChecklistModal(false)}
                >
                  Back
                </button>
              </div>

              {/* Reservations List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-5 lg:gap-10 gap-2">
                {checkoutlist ? (
                  [...checkoutlist].reverse().map((res, index) => {
                    const total =
                      res.Cart?.reduce(
                        (acc, item) => acc + parseInt(item.Price) * parseInt(res.Duration),
                        0
                      ) || 0;
                    return (
                      <div
                        key={index}
                        className={`relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl border-l-4 
            ${theme === "Dark"
                            ? "bg-[#1A1D33] border-blue-500 text-white shadow-lg"
                            : "bg-white border-blue-600 text-slate-800 shadow-md"}
          `}
                      >
                        {/* Top Section: Price & Status Accent */}
                        <div className="p-4 pb-0 flex justify-between items-start">
                          <div className="space-y-1">

                            <h3 className="text-sm sm:text-lg  font-extrabold">{res.ClientName}</h3>
                          </div>
                          <div className="text-right">
                            <p className="text-sm sm:text-lg font-black text-green-500">
                              <span className='text-xs sm:text-md'>
                                KES
                              </span> {parseInt(res.Total) * Math.max(1, Math.round((Date.now() - res.Date) / (1000 * 60 * 60 * 24)))}
                            </p>
                            <p className="text-[10px] font-medium opacity-60 uppercase">Total Amount</p>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="p-4 grid grid-cols-2 gap-2 border-b border-opacity-10 border-gray-500">
                          <div className="space-y-1">
                            <p className="sm:text-[11px] text-[9px]  uppercase opacity-50 font-bold">Contact</p>
                            <p className="text-xs sm:text-sm  font-medium">{res.ClientPhone || "N/A"}</p>
                          </div>
                          <div className="space-y-1 text-right">
                            <p className="sm:text-[11px] text-[9px] uppercase opacity-50 font-bold">Date</p>
                            <p className="text-xs sm:text-sm font-medium">
                              {new Date(res.Date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              })}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="sm:text-[11px] text-[9px] uppercase opacity-50 font-bold">Guests</p>
                            <p className="text-xs sm:text-sm font-medium">{res.NumberOfPeople} People</p>
                          </div>
                          <div className="space-y-1 text-right">
                            <p className="sm:text-[11px] text-[9px] uppercase opacity-50 font-bold">Stay</p>

                            <p className="text-xs sm:text-sm font-medium font-mono bg-opacity-10 px-2 py-1 rounded bg-blue-500 inline-block">
                              {Math.round((Date.now() - res.Date) / (1000 * 60 * 60 * 24))} Days
                            </p>
                          </div>
                        </div>

                        {/* Items / Tags Area */}
                        <div className="px-6 py-2">
                          <div className="flex flex-wrap gap-2">
                            {res.Cart?.length > 0 ? (
                              res.Cart.map((item, i) => (
                                <span
                                  key={i}
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md border 
                      ${theme === "Dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50 text-gray-600"}`}
                                >
                                  {item.stock} - {item.Name} @ KES {item.Price}/=
                                </span>
                              ))
                            ) : (
                              <span className="text-xs italic opacity-40">No items selected</span>
                            )}
                          </div>
                        </div>
                        {/* Modern Action Bar */}
                        <div className={`flex flex-row sm:flex-row p-2 gap-3 w-full`}>
                          {/* Receipt - Blue */}
                          <button
                            onClick={() => (
                              setReceiptModal(true), handleTicketClick(res.id, res.Cart, res.EmployeeID, res.CashSale, res.Date, res.Total))}
                            className={`py-2 px-3 rounded-lg text-xs sm:text-sm w-full
      ${theme === "Dark"
                                ? "bg-blue-800 hover:bg-blue-600"
                                : "bg-blue-600 text-white hover:bg-blue-800 shadow-lg"
                              }`}>
                            Receipt
                          </button>

                          {/* Confirm - Green */}

                          <button
                            onClick={() => {
                              setSelectedReservation(res);
                              setSendCartModal(true);
                            }}
                            className={`py-2 px-3 rounded-lg  text-xs sm:text-sm  w-full
      ${theme === "Dark"
                                ? "bg-green-800 hover:bg-green-600"
                                : "bg-green-600 text-white hover:bg-green-800 shadow-lg"
                              }`} >
                            Confirm
                          </button>

                          {/* Cancel - Red */}
                          <button
                            onClick={() => {
                              setSelectedReservation(res)
                              setCancelCartModal(true)
                            }}
                            className={`py-2 px-3 rounded-lg  text-xs sm:text-sm  w-full
      ${theme === "Dark"
                                ? "bg-red-800 hover:bg-red-600"
                                : "bg-red-600 text-white hover:bg-red-800 shadow-lg"
                              }`}>
                            Cancel
                          </button>
                        </div>


                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <div className="text-6xl mb-4">📅</div>
                    <p className="text-xl font-light opacity-50">No Checkout found in the system.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )
      }


      {
        sendCartModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div
              className={`p-6 rounded-xl shadow w-96 mx-4
        ${theme === "Dark" ? "bg-[#171941]" : "bg-white"}
      `}
            >
              <h2 className="text-md sm:text-lg font-bold mb-4 text-center">
                Confirm Checkout
              </h2>

              <div className="mt-4 font-bold text-sm sm:text-lg">
                Served By {userAccountName}
              </div>

              <div className="flex flex-row justify-evenly mt-4">

                <button
                  className={`text-white px-4 py-2 rounded text-xs sm:text-base
    ${theme === "Dark"
                      ? "bg-green-800 hover:bg-green-600"
                      : "bg-green-600 hover:bg-green-800"}
  `}
                  onClick={() => (handleCart(selectedReservation), setSendCartModal(false))}
                >
                  Confirm
                </button>

                <button
                  className={`text-white px-4 py-2 rounded text-xs sm:text-base
            ${theme === "Dark"
                      ? "bg-red-800 hover:bg-red-600"
                      : "bg-red-600 hover:bg-red-800"}
          `}
                  onClick={() => (sendCartModalFun())}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }


      {
        cancelCartModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div
              className={`p-6 rounded-xl shadow w-96 mx-4
        ${theme === "Dark" ? "bg-[#171941]" : "bg-white"}
      `}
            >
              <h2 className="text-md sm:text-lg font-bold mb-4 text-center">
                Are you sure you want to cancel this Checkout ??
              </h2>

              <div className="mt-4 font-bold text-sm sm:text-lg">
                Canceled by {userAccountName}
              </div>

              <div className="flex flex-row justify-evenly mt-4">

                <button
                  className={`text-white px-4 py-2 rounded text-xs sm:text-base
    ${theme === "Dark"
                      ? "bg-green-800 hover:bg-green-600"
                      : "bg-green-600 hover:bg-green-800"}
  `}
                  onClick={() => (handleCancelCheckout(selectedReservation), setCancelCartModal(false))}
                >
                  Confirm
                </button>

                <button
                  className={`text-white px-4 py-2 rounded text-xs sm:text-base
            ${theme === "Dark"
                      ? "bg-red-800 hover:bg-red-600"
                      : "bg-red-600 hover:bg-red-800"}
          `}
                  onClick={() => (cancelCartModalFun())}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }


      {/*Categories modal */}
      {
        catManageModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div
              className={`p-6 rounded-xl shadow-lg w-96 mx-4
                            ${theme === "Dark" ? "bg-[#171941]" : "bg-white"}
                        `}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className=" text-sm sm:text-lg font-bold ">Manage Categories</h3>


                <button
                  className={`px-5 py-2 rounded-2xl text-white font-medium  text-xs sm:text-base
                                    ${theme === "Dark"
                      ? "bg-red-800 hover:bg-red-600"
                      : "bg-red-600 hover:bg-red-800"
                    }`}
                  onClick={catManageModalFun}
                >
                  Back
                </button>
              </div>

              {/* Scrollable Categories Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-1 px-5 sm:px-10 pt-1 overflow-y-auto">
                {categories && categories.map((category, index) => (
                  <div
                    key={index}
                    className={`shadow-lg text-center p-3 sm:p-4 rounded-xl sm:my-1 
            ${theme === "Dark" ? "border border-blue-800" : "bg-white hover:bg-blue-200"}`}
                  >
                    <p className="font-semibold text-sm sm:text-md">{category.Name}</p>
                    <button
                      className={`py-1 px-2 mt-2 mx-2 rounded  text-xs sm:text-sm ${theme === "Dark"
                        ? "text-white bg-blue-800 hover:bg-blue-600"
                        : "bg-blue-600 text-white hover:bg-blue-800"
                        }`}
                      onClick={() => catEditsetID(category.id, category.Name)}
                    >
                      Edit
                    </button>
                    <button
                      className={`px-2 py-1 mx-2 mt-2 rounded text-xs sm:text-sm  ${theme === "Dark"
                        ? "text-white bg-red-800 hover:bg-red-600"
                        : "bg-red-600 text-white hover:bg-red-800"
                        }`}
                      onClick={() => catDeletesetID(category.id, category.Name)}
                    >
                      Delete
                    </button>
                  </div>
                ))}

                {!categories &&
                  <div className="flex flex-col items-center mt-20">
                    <FaTags className={`text-4xl ${theme === "Dark" ? "text-white" : "text-black"}`} />
                    <h1 className="text-lg mt-2">No Categories Added</h1>
                  </div>
                }
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-evenly mt-6">

                <button
                  className={`text-xs sm:text-sm px-3 sm:m-0 m-1 py-1 rounded ${theme === "Dark"
                    ? "text-white bg-green-800 hover:bg-green-600"
                    : "bg-green-600 text-white hover:bg-green-800"
                    }`}
                  onClick={() => setCatModal(true)}
                >
                  + Add Category
                </button>



              </div>
            </div>
          </div>
        )
      }


      {
        catModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div
              className={`p-6 rounded-xl shadow-lg w-96 mx-4
                            ${theme === "Dark" ? "bg-[#171941]" : "bg-white"}
                        `}
            >
              <h2 className="text-md sm:text-lg font-bold mb-5 text-center">
                Add Category
              </h2>

              <div className="space-y-2">

                {/* CATEGORY NAME */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">
                    Category Name
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter category name"
                      className="w-full p-3 border border-gray-300 rounded text-sm sm:text-base
                                        focus:outline-none focus:ring-2 focus:ring-[#303133]
                                        pl-12 shadow-md"
                      style={{ color: "#000000" }}
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                    />
                    <FaTags className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-lg" />
                  </div>
                </div>

              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-evenly mt-6">
                <button
                  className={`px-5 py-2 rounded text-white font-medium text-xs sm:text-base
                                    ${theme === "Dark"
                      ? "bg-green-800 hover:bg-green-600"
                      : "bg-green-600 hover:bg-green-800"
                    }`}
                  onClick={addCategory}
                >
                  Add
                </button>

                <button
                  className={`px-5 py-2 rounded text-white font-medium  text-xs sm:text-base
                                    ${theme === "Dark"
                      ? "bg-red-800 hover:bg-red-600"
                      : "bg-red-600 hover:bg-red-800"
                    }`}
                  onClick={catModalFun}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }


      {/*Categories edit */}
      {
        catModalEdit && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div
              className={`p-6 rounded-xl shadow-lg w-96 m-4
                            ${theme === "Dark" ? "bg-[#171941]" : "bg-white"}
                        `}
            >
              <h2 className="text-sm sm:text-lg font-bold mb-5 text-center">
                Edit Category
              </h2>

              <div className="space-y-2">

                {/* CATEGORY NAME */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">
                    Category Name
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter category name"
                      className="w-full p-3 border border-gray-300 rounded text-xs sm:text-base
                                        focus:outline-none focus:ring-2 focus:ring-[#303133]
                                        pl-12 shadow-md"
                      style={{ color: "#000000" }}
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                    />
                    <FaTags className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-lg" />
                  </div>
                </div>

              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-evenly mt-6">
                <button
                  className={`px-5 py-2 rounded text-white font-medium text-xs sm:text-base
                                    ${theme === "Dark"
                      ? "bg-green-800 hover:bg-green-600"
                      : "bg-green-600 hover:bg-green-800"
                    }`}
                  onClick={editCategories}
                >
                  Save
                </button>

                <button
                  className={`px-5 py-2 rounded text-white font-medium text-xs sm:text-base
                                    ${theme === "Dark"
                      ? "bg-red-800 hover:bg-red-600"
                      : "bg-red-600 hover:bg-red-800"
                    }`}
                  onClick={catModalFunEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/*Categories delete */}
      {
        catModalDelete && (
          <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className={` p-6 rounded-xl shadow w-96  mx-4
                                    ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white "
              }`
            }>
              <h2 className="text-sm sm:text-lg font-bold mb-4 text-center">Delete Category </h2>

              <div className="mt-4 font-semibold text-sm sm:text-md">
                Are you sure you want to delete this category?
              </div>
              <div className=" flex flex-row justify-evenly">
                <button
                  className={` text-white px-4 py-2 rounded  mt-4  text-xs sm:text-base
                                            
                                          ${theme === "Dark"
                      ? "bg-green-800  hover:bg-green-600"
                      : "bg-green-600  hover:bg-green-800 "
                    }`}
                  onClick={deleteCategory}
                >
                  OK
                </button>
                <button
                  className={` text-white px-4 py-2 rounded mt-4 text-xs sm:text-base
                                              ${theme === "Dark"
                      ? "bg-red-800  hover:bg-red-600"
                      : "bg-red-600  hover:bg-red-800 "
                    }`}
                  onClick={catModalFunDelete}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )
      }

      {/* ticket Modal */}
      {
        ticketModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div
              className={`p-6 rounded-xl shadow-lg w-96 mx-4
        ${theme === "Dark" ? "bg-[#171941]" : "bg-white"}`}
            >
              <h2 className="text-sm sm:text-lg font-bold mb-5 text-center">
                Guest Details
              </h2>


              <div className="space-y-3">

                {/* CLIENT NAME */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">
                    Client <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter client name"
                      className={`w-full p-3 border rounded text-sm sm:text-base
        focus:outline-none focus:ring-2 pl-12 shadow-md
        ${clientNameError
                          ? "border-red-500 ring-red-300"
                          : "border-gray-300 focus:ring-[#303133]"
                        }`}
                      style={{ color: "#000000" }}
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        setClientNameError("");
                      }}
                    />
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-lg" />
                  </div>

                  {clientNameError && (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {clientNameError}
                    </p>
                  )}
                </div>

                {/* PHONE NUMBER */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      className={`w-full p-3 border rounded text-sm sm:text-base
              focus:outline-none focus:ring-2 pl-12 shadow-md
              ${clientError
                          ? "border-red-500 ring-red-300"
                          : "border-gray-300 focus:ring-[#303133]"}`}
                      style={{ color: "#000000" }}
                      value={clientPhone}
                      onChange={(e) => {
                        setClientPhone(e.target.value);

                      }}
                    />
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-lg" />
                  </div>

                </div>

                {/* ID NUMBER */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">
                    ID / Passport Number (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter number"
                      className="w-full p-3 border border-gray-300 rounded text-sm sm:text-base
              focus:outline-none focus:ring-2 focus:ring-[#303133]
              pl-12 shadow-md"
                      style={{ color: "#000000" }}
                      value={clientIdNumber}
                      onChange={(e) => setClientIdNumber(e.target.value)}
                    />
                    <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-lg" />
                  </div>
                </div>

                {/* NUMBER OF PEOPLE */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">
                    Number of People (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      placeholder="Enter number of people"
                      className="w-full p-3 border border-gray-300 rounded text-sm sm:text-base
              focus:outline-none focus:ring-2 focus:ring-[#303133]
              pl-12 shadow-md"
                      style={{ color: "#000000" }}
                      value={numberOfPeople}
                      onChange={(e) => setNumberOfPeople(e.target.value)}
                    />
                    <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-lg" />
                  </div>
                </div>

              </div>



              <div
                className={`mt-4 font-bold text-sm sm:text-lg text-center ${totalError ? "" : ""
                  }`}
              >
                Total: Ksh{" "}
                {isNaN(total)
                  ? "0.00"
                  : parseInt(total).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </div>


              {/* SERVED BY */}
              <div className="font-semibold text-xs sm:text-base mt-4 text-center text-gray-700">
                Served by {userAccountName}
              </div>


              {/* ACTION BUTTONS */}
              <div className="flex justify-evenly mt-6">


                <button
                  className={`px-5 py-2 rounded text-white font-medium text-xs sm:text-base
            ${theme === "Dark"
                      ? "bg-green-800 hover:bg-green-600"
                      : "bg-green-600 hover:bg-green-800"}`}
                  onClick={() => {

                    if (!clientName.trim()) {
                      setClientNameError("Client name is required");
                      return;
                    }

                    handleGuest("Guest");
                  }}
                >
                  Approve
                </button>

                <button
                  className={`px-5 py-2 rounded text-white font-medium text-xs sm:text-base
            ${theme === "Dark"
                      ? "bg-red-800 hover:bg-red-600"
                      : "bg-red-600 hover:bg-red-800"}`}
                  onClick={ticketModalFun}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* receipt details Modal */}
      {
        receiptDetailsModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div
              className={`p-6 rounded-xl shadow w-96 ${theme === "Dark" ? "bg-[#171941]" : "bg-white"
                }`}
            >
              <h2 className="text-lg font-bold mb-4 text-center">
                Enter Receipt details
              </h2>

              <div className="mt-4 font-bold text-lg">
                Total: Ksh {total.toFixed(2)}
              </div>

              <div className="mt-4">
                <div className="mt-4  font-bold text-lg">
                  Sold by {userAccountName}
                </div>

              </div>

              <div className="flex flex-row justify-evenly">
                <button
                  className={`text-white px-4 py-2 rounded mt-4 ${theme === "Dark"
                    ? "bg-green-800 hover:bg-green-600"
                    : "bg-green-600 hover:bg-green-800"
                    }`}
                  onClick={receiptDetailsClose}
                >
                  View Receipt
                </button>
                <button
                  className={`text-white px-4 py-2 rounded mt-4 ${theme === "Dark"
                    ? "bg-red-800 hover:bg-red-600"
                    : "bg-red-600 hover:bg-red-800"
                    }`}
                  onClick={receiptDetailsModalFun}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }


      {
        receiptModal && (
          <div className="w-full z-50 flex items-center justify-center bg-black bg-opacity-90 overflow-y-auto h-90%">

            <div
              className={`p-4  shadow w-[380px] font-sans text-sm  print-area receipt-container
        ${theme === "Dark" ? "bg-white text-black" : "bg-white text-black"}
      `}
            >
              <div className="text-center text-2xl font-bold">
                <p className="text-xl font-extrabold tracking-tight uppercase font-sans">
                  {bizName}
                </p>
                <p className="font-semibold text-xs">Email : {bizEmail}</p>
                <p className="font-semibold text-xs">TEL :{bizPhone}</p>
                {/**
               *  <p className="font-semibold text-xs">VAT #: A002691181T | PIN  #: A002691181T</p>
               */}

              </div>

              {/* Paybill Section with background 
             <div className="print-bg bg-black text-white text-4xl py-1 text-center font-bold">
              PAYBILL: 157424
            </div>
            */}


              <div className="border-t border-dotted border-black/20 mt-1"></div>

              {/* Cash Sale Header */}

              <div className="text-center font-bold text-lg mb-2">CASH SALE</div>
              <div className="border-t border-dotted border-black/20"></div>
              <div className="flex justify-between mb-2 font-bold">
                <div>
                  {/**<p className="text-sm  ">Till No: {selectedTill}</p> */}
                  <p className="text-sm ">M/S: {userAccountName}</p>
                  <p className="text-sm ">PIN:</p>
                </div>
                <div>
                  <p className="text-sm">Cash Sale #: {receiptNumber}</p>
                </div>

              </div>
              <div className="border-t border-dotted border-black/20"></div>

              <div className="flex justify-between mb-1">
                <p className="text-sm">Date: {selectedDate}</p>
                <p className="text-sm ">Time:<span className="text-xs mx-3"> {selectedTime}</span></p>
              </div>
              <div className="border-t border-dotted border-black/20"></div>

              <p className="flex justify-evenly font-bold text-sm">This represent for one (1) day only</p>

              <div className="border-t border-dotted border-black/20"></div>
              <div >
                <div className="flex justify-between font-bold text-sm">
                  <div className="w-1/2">ITEM</div>
                  <div className="grid grid-cols-2 gap-4 w-40 text-right">
                    <span>PRICE</span>
                    <span>AMOUNT</span>
                  </div>
                </div>
                <div className="border-t border-dotted border-black/20"></div>


                <div className="bg-white text-black">
                  {cart1.map((item, i) => (
                    <div key={i} className="py-1">
                      <div className="flex justify-between font-bold">
                        <div className="font-sm">{item.Name}</div>
                        <div className="text-xs">A</div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-xs" >

                          <span className="ml-8 text-sm ">
                            Qty : {parseFloat(item.stock).toFixed(0)}
                          </span>
                        </div>
                        <div >
                          <div className="grid grid-cols-2 gap-4 w-40 text-right">

                            <span>{item.Price.toLocaleString()}</span>
                            <span>{(parseInt(item.stock) * parseInt(item.Price)).toLocaleString()}</span>

                          </div>
                        </div>
                      </div>
                      <div className="border-t border-dotted border-black/20"></div>
                    </div>

                  ))}
                </div>


                <div className="border-t border-dotted border-black/20"></div>
                <div className=" my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>TOTAL:</span>
                  <span>{total1.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-dotted border-black/20"></div>
                <div className="flex justify-between font-bold text-lg">
                  <span>CASH:</span>
                  <span>{total1.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-dotted border-black/20"></div>
                <div className="flex justify-between font-bold text-lg">
                  <span>CHANGE:</span>
                  <span>0.00</span>
                </div>
              </div>
              <div className="border-t border-dotted border-black/20"></div>

              {/* Footer Summary */}
              <div className="text-xs space-y-1">
                <p className="flex items-center font-bold">
                  <strong className="flex-1">TOTAL ITEMS:</strong>
                  <span className="text-center w-40 mr-7">{totalItems1}</span>
                </p>
                <div className="border-t border-dotted border-black/20"></div>
                <p className="flex items-center font-bold">
                  <strong className="flex-1">TOTAL QTY:</strong>
                  <span className="text-center w-40 mr-7">{totalQty1}</span>
                </p>
                <div className="border-t border-dotted border-black/20"></div>



                <div className="border-t border-dotted border-black/20"></div>

                {/* VAT Breakdown */}
                <div className="mt-2">
                  <div className="grid grid-cols-4 text-xs mr-6">
                    <p className="col-span-1 underline text-left"><strong>CODE</strong></p>
                    <p className="col-span-1 underline text-right"><strong>VATABLE AMT</strong></p>
                    <p className="col-span-1 underline text-right"><strong>VAT AMT</strong></p>
                    <p className="col-span-1 underline text-right"><strong>TOTAL</strong></p>

                    {['A', 'E', 'Z'].map(code => (
                      <React.Fragment key={code}>
                        <p className="col-span-1 text-left font-bold">{code}</p>
                        <p className="col-span-1 text-right font-bold">{format(vatBreakdown1[code].vatable - vatBreakdown1[code].vat)}</p>
                        <p className="col-span-1 text-right font-bold">{format(vatBreakdown1[code].vat)}</p>
                        <p className="col-span-1 text-right font-bold">
                          {format(vatBreakdown1[code].vatable)}
                        </p>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="border-t border-dotted border-black/20"></div>
                <p className="mt-2 font-semibold">VAT CODE:(A)=VATABLE, (E)=EXEMPT, (Z)=ZERO RATED</p>
                <p className="font-semibold">PRICES INCLUSIVE OF VAT WHERE APPLICABLE</p>
                <div className="border-t border-dotted border-black/20"></div>
                <div className="border-t border-dotted border-black/20"></div>
                <p className="font-bold">YOU WERE SERVED BY : {userAccountName}</p>
                <div className="border-t border-dotted border-black/20"></div>

                <div className="flex justify-between mb-2 font-bold">
                  <div>
                    <p className="text-sm">Client: {clientName1}</p>
                    <p className="text-sm">Phone: {clientPhone1}</p>
                    <p className="text-sm">ID #: {clientIdNumber1}</p>
                    <p className="text-sm">Guests: {numberOfPeople1} </p>
                  </div>
                </div>
                <div className="border-t border-dotted border-black/20"></div>
                <div className="text-xm text-center font-bold">
                  <p>GOODS ONCE SOLD CANNOT BE ACCEPTED</p>
                  <p>BACK FOR REFUND OR ANY OTHER REASON</p>
                </div>
                <div className="border-t border-dotted border-black/20"></div>
                <div className="border-t border-dotted border-black/20"></div>
                <div className="border-t border-dotted border-black/20"></div>

                {/* QR Code Placeholder */}
                <div className="flex justify-center my-3">
                  <QRCodeSVG
                    value={JSON.stringify({
                      invoice: receiptNumber,
                      totalItems: totalItems1,
                      totalQty: totalQty1,
                      totalWeight: totalWeight1.toFixed(2),
                      totalVAT: vatBreakdown1.A.vat.toFixed(2),
                      totalAmount: (vatBreakdown1.A.vatable + vatBreakdown1.A.vat).toFixed(2),
                    })}
                    size={96}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    className="border border-gray-400"
                  />
                </div>
                <div className="border-t border-black mb-2"></div>

              </div>
              <div className="text-xs text-center font-semibold">
                <p >Thank You......Come Again.</p>
              </div>
              <div className=" no-print flex flex-row justify-evenly mt-4">
                <button
                  className={`text-white px-4 py-2 rounded 
            ${theme === "Dark" ? "bg-green-800 hover:bg-green-600" : "bg-green-600 hover:bg-green-800"}`}
                  onClick={() => window.print()}
                >
                  Print
                </button>
                <button
                  className={`text-white px-4 py-2 rounded 
            ${theme === "Dark" ? "bg-red-800 hover:bg-red-600" : "bg-red-600 hover:bg-red-800"}`}
                  onClick={receiptModalFun}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* send Modal */}
      {
        sendModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 ">
            <div
              className={`p-6 rounded-xl shadow-lg w-96 mx-4
      ${theme === "Dark" ? "bg-[#171941]" : "bg-white"}`}
            >
              <h2 className="text-sm sm:text-lg font-bold mb-5 text-center">
                Confirm Checkout
              </h2>

              <div className="space-y-3">

                {/* CLIENT NAME */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">
                    Client <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter client name"
                      className={`w-full p-3 border rounded text-sm sm:text-base
        focus:outline-none focus:ring-2 pl-12 shadow-md
        ${clientNameError
                          ? "border-red-500 ring-red-300"
                          : "border-gray-300 focus:ring-[#303133]"
                        }`}
                      style={{ color: "#000000" }}
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        setClientNameError("");
                      }}
                    />
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-lg" />
                  </div>

                  {clientNameError && (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {clientNameError}
                    </p>
                  )}
                </div>

                {/* PHONE NUMBER */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      className={`w-full p-3 border rounded text-sm sm:text-base
              focus:outline-none focus:ring-2 pl-12 shadow-md
              ${clientError
                          ? "border-red-500 ring-red-300"
                          : "border-gray-300 focus:ring-[#303133]"}`}
                      style={{ color: "#000000" }}
                      value={clientPhone}
                      onChange={(e) => {
                        setClientPhone(e.target.value);

                      }}
                    />
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-lg" />
                  </div>

                </div>

                {/* ID NUMBER */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">
                    ID / Passport Number (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter number"
                      className="w-full p-3 border border-gray-300 rounded text-sm sm:text-base
              focus:outline-none focus:ring-2 focus:ring-[#303133]
              pl-12 shadow-md"
                      style={{ color: "#000000" }}
                      value={clientIdNumber}
                      onChange={(e) => setClientIdNumber(e.target.value)}
                    />
                    <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-lg" />
                  </div>
                </div>

                {/* NUMBER OF PEOPLE */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">
                    Number of People (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      placeholder="Enter number of people"
                      className="w-full p-3 border border-gray-300 rounded text-sm sm:text-base
              focus:outline-none focus:ring-2 focus:ring-[#303133]
              pl-12 shadow-md"
                      style={{ color: "#000000" }}
                      value={numberOfPeople}
                      onChange={(e) => setNumberOfPeople(e.target.value)}
                    />
                    <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-lg" />
                  </div>
                </div>

              </div>

              {/*Total*/}
              <div
                className={`mt-4 font-bold text-sm sm:text-lg text-center ${totalError ? "" : ""
                  }`}
              >
                Total: Ksh{" "}
                {isNaN(total)
                  ? "0.00"
                  : parseInt(total).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </div>

              {totalError && (
                <p className="text-red-500 text-xs mt-1 font-medium text-center">
                  {totalError}
                </p>
              )}

              {/* SERVED BY */}
              <div className="mt-2 font-semibold text-xs sm:text-base text-center text-gray-700">
                Served by {userAccountName}
              </div>

              {/* BUTTONS */}
              <div className="flex justify-evenly mt-6">


                <button
                  className={`px-5 py-2 rounded text-white font-medium text-sm
          ${theme === "Dark"
                      ? "bg-green-800 hover:bg-green-600"
                      : "bg-green-600 hover:bg-green-800"}`}
                  onClick={() => {

                    if (!clientName.trim()) {
                      setClientNameError("Client name is required");
                      return;
                    }

                    handleConfirmSell("Client");
                  }}
                >
                  Confirm
                </button>

                <button
                  className={`px-5 py-2 rounded text-white font-medium text-sm
          ${theme === "Dark"
                      ? "bg-red-800 hover:bg-red-600"
                      : "bg-red-600 hover:bg-red-800"}`}
                  onClick={sendModalFun}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }

      {reservedCheckoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 ">
          <div
            className={`p-6 rounded-xl shadow-lg w-96 mx-4
      ${theme === "Dark" ? "bg-[#171941]" : "bg-white"}`}
          >
            <h2 className="text-sm sm:text-lg font-bold mb-5 text-center">
              Reserve Booking
            </h2>

            <div className="space-y-3">

              {/* CLIENT NAME */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">
                  Client Name <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter client name"
                    className={`w-full p-3 border rounded text-sm sm:text-base
              focus:outline-none focus:ring-2 pl-12 shadow-md
              ${clientNameError
                        ? "border-red-500 ring-red-300"
                        : "border-gray-300 focus:ring-[#303133]"
                      }`}
                    style={{ color: "#000000" }}
                    value={clientName}
                    onChange={(e) => {
                      setClientName(e.target.value);
                      setClientNameError("");
                    }}
                  />
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-lg" />
                </div>

                {clientNameError && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {clientNameError}
                  </p>
                )}
              </div>

              {/* PHONE */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">
                  Phone Number
                </label>

                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    className="w-full p-3 border border-gray-300 rounded text-sm sm:text-base
              focus:outline-none focus:ring-2 focus:ring-[#303133]
              pl-12 shadow-md"
                    style={{ color: "#000000" }}
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                  />
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-lg" />
                </div>
              </div>

              {/* ID */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">
                  ID / Passport Number (Optional)
                </label>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter ID number"
                    className="w-full p-3 border border-gray-300 rounded text-sm sm:text-base
              focus:outline-none focus:ring-2 focus:ring-[#303133]
              pl-12 shadow-md"
                    style={{ color: "#000000" }}
                    value={clientIdNumber}
                    onChange={(e) => setClientIdNumber(e.target.value)}
                  />
                  <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-lg" />
                </div>
              </div>

              {/* NUMBER OF PEOPLE */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">
                  Number of People (Optional)
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter number of people"
                    className="w-full p-3 border border-gray-300 rounded text-sm sm:text-base
              focus:outline-none focus:ring-2 focus:ring-[#303133]
              pl-12 shadow-md"
                    style={{ color: "#000000" }}
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(e.target.value)}
                  />
                  <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-lg" />
                </div>
              </div>

              {/* RESERVATION DATE */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">
                  Reservation Date <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    type="date"
                    className={`w-full p-3 border rounded text-sm sm:text-base
              focus:outline-none focus:ring-2 pl-12 shadow-md
              ${reservationDateError
                        ? "border-red-500 ring-red-300"
                        : "border-gray-300 focus:ring-[#303133]"
                      }`}
                    value={reservationDate}
                    onChange={(e) => {
                      setReservationDate(e.target.value);
                      setReservationDateError("");
                    }}
                  />
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-lg" />
                </div>

                {reservationDateError && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {reservationDateError}
                  </p>
                )}
              </div>

              {/* DURATION */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">
                  Duration (Days) <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter duration in Days"
                    className={`w-full p-3 border rounded text-sm sm:text-base
              focus:outline-none focus:ring-2 pl-12 shadow-md
              ${durationError
                        ? "border-red-500 ring-red-300"
                        : "border-gray-300 focus:ring-[#303133]"
                      }`}
                    value={duration}
                    onChange={(e) => {
                      setDuration(e.target.value);
                      setDurationError("");
                    }}
                  />
                  <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-lg" />
                </div>

                {durationError && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {durationError}
                  </p>
                )}
              </div>

            </div>

            {/*Total*/}
            <div
              className={`mt-4 font-bold text-sm sm:text-lg text-center ${totalError ? "" : ""
                }`}
            >
              Total: Ksh{" "}
              {isNaN(total)
                ? "0.00"
                : parseInt(total).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </div>

            {/* BUTTONS */}
            <div className="flex flex-row justify-evenly ">

              <button
                className={`py-2 px-3  text-xs sm:text-sm md:py-2 md:px-4 md:text-base mt-4 rounded text-white
      ${theme === "Dark"
                    ? "bg-green-800 hover:bg-green-600"
                    : "bg-green-600 hover:bg-green-800"
                  }`}
                onClick={() => {
                  let hasError = false;

                  if (!clientName.trim()) {
                    setClientNameError("Client name is required");
                    hasError = true;
                  }

                  if (!reservationDate) {
                    setReservationDateError("Reservation date is required");
                    hasError = true;
                  }

                  if (!duration || duration <= 0) {
                    setDurationError("Duration must be at least 1 day");
                    hasError = true;
                  }

                  if (hasError) return;

                  handleConfirmReserve();
                }}
              >
                Confirm
              </button>

              <button
                className={`py-2 px-3  text-xs sm:text-sm md:py-2 md:px-4 md:text-base mt-4 rounded text-white
      ${theme === "Dark"
                    ? "bg-red-800 hover:bg-red-600"
                    : "bg-red-600 hover:bg-red-800"
                  }`}
                onClick={reservedCheckoutModalFun}
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}


      {/* Auto-Close Modals */}
      {
        sendModalSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>

                <TiTick className='text-green-600 text-4xl  ' />
                <h2 className="text-lg font-bold mb-4">Success</h2>
              </div>
              <p>Confirmed Successfully</p>
            </div>
          </div>
        )
      }

      {
        sendModalFail && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>
                <TbXboxX className='text-red-600 text-3xl   ' />
                <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
              </div>
              <p>Failed .Try Again </p>
            </div>
          </div>
        )
      }


      {/* Auto-Close Modals */}
      {
        guestModalSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>

                <TiTick className='text-green-600 text-4xl  ' />
                <h2 className="text-lg font-bold mb-4">Success</h2>
              </div>
              <p>Guest booked successfully</p>
            </div>
          </div>
        )
      }

      {
        guestModalFail && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>
                <TbXboxX className='text-red-600 text-3xl   ' />
                <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
              </div>
              <p>Guest booked Failed </p>
            </div>
          </div>
        )
      }


      {/* Auto-Close Modals */}
      {
        reserveModalSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>

                <TiTick className='text-green-600 text-4xl  ' />
                <h2 className="text-lg font-bold mb-4">Success</h2>
              </div>
              <p>The Room has been Reserved </p>
            </div>
          </div>
        )
      }

      {
        reserveModalFail && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>
                <TbXboxX className='text-red-600 text-3xl   ' />
                <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
              </div>
              <p>The Room was NOT sent to Reserve </p>
            </div>
          </div>
        )
      }

      {
        sendModalFailTotal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80  z-50">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>
                <TbXboxX className='text-red-600 text-3xl   ' />
                <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
              </div>
              <p>The Checkout Menu is Empty</p>
            </div>
          </div>
        )
      }



      {/* Auto-Close Modals */}


      {
        addCatModalsuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>

                <TiTick className='text-green-600 text-4xl  ' />
                <h2 className="text-lg font-bold mb-4">Success</h2>
              </div>
              <p>The Category was Added</p>
            </div>
          </div>
        )
      }

      {
        addCatModalFail && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>
                <TbXboxX className='text-red-600 text-3xl   ' />
                <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
              </div>
              <p>The Category was not Added</p>
            </div>
          </div>
        )
      }


      {
        addCatModalFailBlank && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}
            >
              <div className='flex justify-center'>
                <TbXboxX className='text-red-600 text-3xl   ' />
                <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
              </div>
              <p>Fill all Fields</p>
            </div>
          </div>
        )
      }


      {
        editCatModalsuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>

                <div className='flex justify-center'>

                  <TiTick className='text-green-600 text-4xl  ' />
                  <h2 className="text-lg font-bold mb-4">Success</h2>
                </div>
              </div>
              <p>The Category was Edited</p>
            </div>
          </div>
        )
      }



      {
        editCatModalFail && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>
                <TbXboxX className='text-red-600 text-3xl   ' />
                <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
              </div>
              <p>The Category was not Edited</p>
            </div>
          </div>
        )
      }


      {
        deleteCatModalsuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>
                <TiTick className='text-green-600 text-4xl  ' />
                <h2 className="text-lg font-bold mb-4">Deleted</h2>
              </div>
              <p>The Category was Deleted</p>
            </div>
          </div>
        )
      }

      {
        deleteCatModalFail && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>
                <TbXboxX className='text-red-600 text-3xl   ' />
                <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
              </div>
              <p>The Category was not Deleted</p>
            </div>
          </div>
        )
      }


      {/**items auto modal */}
      {
        addItemModalsuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className={` p-6 rounded-xl 
                          
                           ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>

                <TiTick className='text-green-600 text-4xl  ' />
                <h2 className="text-lg font-bold mb-4">Success</h2>
              </div>

              <p>The Room was Added</p>
            </div>
          </div>
        )
      }

      {
        addItemModalFail && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className={` p-6 rounded-xl 
                          
                           ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`} >
              <div className='flex justify-center'>
                <TbXboxX className='text-red-600 text-3xl   ' />
                <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
              </div>
              <p>The Room was not Added</p>
            </div>
          </div>
        )
      }

      {
        addItemModalFailBlank && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className={` p-6 rounded-xl 
                          
                           ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>
                <TbXboxX className='text-red-600 text-3xl   ' />
                <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
              </div>
              <p>Fill all Fields</p>
            </div>
          </div>
        )
      }

      {
        editItemModalsuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className={`
                  p-6 rounded-xl w-[90%] max-w-md transition-all
                  ${theme === "Dark"
                ? "bg-[#171941] text-white"
                : "bg-white text-black shadow-2xl"
              }
              `}>

              {/* Header */}
              <div className="flex justify-center items-center gap-2 mb-3">
                <TiTick className="text-green-500 text-4xl" />
                <h2 className="text-xl font-bold">Updated Successfully</h2>
              </div>

              <p className="font-semibold text-center mb-3">
                Changes made:
              </p>

              {/* Details list */}
              <ul className="mt-2 space-y-2">
                {changeDetails.map((c, i) => (
                  <li
                    key={i}
                    className={`
                                  p-3 rounded-lg flex gap-2 items-start border
                                  ${theme === "Dark"
                        ? "bg-[#1f2250] border-[#2a2d6a]"
                        : "bg-gray-100 border-gray-300"
                      }
                              `}
                  >
                    <span className="text-green-400 font-bold mt-1">•</span>
                    <span className="text-sm leading-5">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      }

      {
        editItemModalFail && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className={` p-6 rounded-xl 
                          
                           ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>
                <TbXboxX className='text-red-600 text-3xl   ' />
                <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
              </div>
              <p>The Room was not Edited</p>
            </div>
          </div>
        )
      }

      {
        deleteItemModalsuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className={` p-6 rounded-xl 
                          
                           ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>
                <TiTick className='text-green-600 text-4xl  ' />
                <h2 className="text-lg font-bold mb-4">Deleted</h2>
              </div>
              <p>The Room was Deleted</p>
            </div>
          </div>
        )
      }

      {
        deleteItemModalFail && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className={` p-6 rounded-xl 
                          
                           ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>
                <TbXboxX className='text-red-600 text-3xl   ' />
                <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
              </div>
              <p>The Room was not Deleted</p>
            </div>
          </div>
        )
      }



      {
        ticketModalSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>
                <TbXboxX className='text-red-600 text-3xl   ' />
                <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
              </div>
              <p>Maintain rooms MUST be less than available rooms"</p>
            </div>
          </div>
        )
      }

      {
        ticketModalFail && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>
                <TbXboxX className='text-red-600 text-3xl   ' />
                <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
              </div>
              <p>No change was made</p>
            </div>
          </div>
        )
      }

      {
        ticketModalFailTotal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>
                <TbXboxX className='text-red-600 text-3xl   ' />
                <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
              </div>
              <p>The cart is Empty</p>
            </div>
          </div>
        )
      }

      {
        ticketModalFailEmployee && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>
                <TbXboxX className='text-red-600 text-3xl   ' />
                <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
              </div>
              <p>Guest Name is not filled</p>
            </div>
          </div>
        )
      }

      {
        itemMaxFail && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>
                <TbXboxX className='text-red-600 text-3xl   ' />
                <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
              </div>
              <p>The Maximum Stock of Item </p>
            </div>
          </div>
        )
      }

      {
        ItemOutStockFail && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                ? " bg-[#171941] "
                : " bg-white shadow-lg "
              }`}>
              <div className='flex justify-center'>
                <TbXboxX className='text-red-600 text-3xl   ' />
                <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
              </div>
              <p>Item is Out of Stock </p>
            </div>
          </div>
        )
      }

    </div >

  )
}

export default Accommodation

