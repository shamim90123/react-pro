// src/components/ui/SweetAlert.jsx
import Swal from "sweetalert2";

// 🔹 Common SweetAlert instance (small toast by default)
const Toast = Swal.mixin({
  toast: true,
  position: "top-end", // right top
  showConfirmButton: false,
  timer: 1800,
  timerProgressBar: true,
  background: "#fff",
  width: "auto",
  customClass: {
    popup: "shadow-md rounded-lg text-sm",
  },
});

// ✅ Utility functions for consistent use across app
export const SweetAlert = {
  // 🔸 Small success toast (default)
  success(message = "Success") {
    return Toast.fire({
      icon: "success",
      title: message,
    });
  },

  // 🔸 Small error toast
  error(message = "Something went wrong") {
    return Toast.fire({
      icon: "error",
      title: message,
    });
  },

  // 🔸 Small warning toast
  warning(message = "Warning") {
    return Toast.fire({
      icon: "warning",
      title: message,
    });
  },

  // 🔸 Small info toast
  info(message = "Information") {
    return Toast.fire({
      icon: "info",
      title: message,
    });
  },

  // 🔸 Larger modal (for confirmations, etc.)
  confirm({
    title = "Are you sure?",
    text = "",
    confirmButtonText = "Yes",
    cancelButtonText = "Cancel",
    confirmColor = "#282560",
  } = {}) {
    return Swal.fire({
      icon: "warning",
      title,
      text,
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: "#d33",
      confirmButtonText,
      cancelButtonText,
      reverseButtons: true,
    });
  },
};



// import { SweetAlert } from "@/components/ui/SweetAlert";

// success toast
// SweetAlert.success("Saved successfully!");

// error toast
// SweetAlert.error("Invalid credentials");

// confirmation dialog
// const confirmed = await SweetAlert.confirm({
//   title: "Delete Lead?",
//   text: "This action cannot be undone.",
// });
// if (confirmed.isConfirmed) {
  // proceed with deletion
// }