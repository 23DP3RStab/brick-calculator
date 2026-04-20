import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  lv: {
    translation: {
      "app_title": "Būvniecības projekti",
      "new_project": "+ Jauns projekts",
      "edit_project": "Labot projektu",
      "excel_report": "Excel atskaite",
      "address": "ADRESE",
      "width": "PLATUMS",
      "height": "AUGSTUMS",
      "blocks": "BLOKI",
      "actions": "DARBĪBAS",
      "edit": "Labot",
      "delete": "Dzēst",
      "confirm_delete": "Vai tiešām vēlaties dzēst šo lietu?",
      "no_data": "Nav atrastu būvniecības projektu.",
      "calculate": "Pārrēķināt visu",
      "save": "Saglabāt projektā",
      "cancel": "Atcelt",
      "wall_proj": "Sienas projekcija",
      "summary": "Aprēķina kopsavilkums",
      "total_blocks": "Kopā bloki",
      "full_blocks": "Pilnie bloki",
      "cut_blocks": "Sagrieztie",
      "window_list": "Logu saraksts",
      "add_window": "+ Pievienot logu",
      "obj_address": "Objekta adrese",
      "wall_width": "Sienas platums (mm)",
      "wall_height": "Sienas augstums (mm)",
      "block_params": "Bloka parametri",
      "block_h": "Augstums",
      "block_l": "Garums",
      "block_w": "Platums",
      "block_o": "Nobīde",
      "no_windows": "Nav pievienotu logu.",
      "window": "Logs",
      "visualization_ready": "Gatavs visualizācijai",
      "press_calculate_1": "Pievienojiet logus un spiediet 'Pārrēķināt',",
      "press_calculate_2": "lai ģenerētu rasējumu.",
      "enter_dimensions": "Ievadiet sienas izmērus!",
      "saved": "Saglabāts!",
      "auth_error": "Autorizācijas kļūda vai nepareizi dati.",
      "error": "Kļūda saglabājot.",
      "max_windows": "Maksimālais logu skaits ir 30!",
      "delete_error": "Kļūda dzēšot."
    }
  },
  en: {
    translation: {
      "app_title": "Construction Projects",
      "new_project": "+ New Project",
      "edit_project": "Edit Project",
      "excel_report": "Excel Report",
      "address": "ADDRESS",
      "width": "WIDTH",
      "height": "HEIGHT",
      "blocks": "BLOCKS",
      "actions": "ACTIONS",
      "edit": "Edit",
      "delete": "Delete",
      "confirm_delete": "Are you sure you want to delete this item?",
      "no_data": "No construction projects found.",
      "calculate": "Recalculate All",
      "save": "Save Project",
      "cancel": "Cancel",
      "wall_proj": "Wall Projection",
      "summary": "Calculation Summary",
      "total_blocks": "Total Blocks",
      "full_blocks": "Whole Blocks",
      "cut_blocks": "Cut Blocks",
      "window_list": "Window List",
      "add_window": "+ Add Window",
      "obj_address": "Object Address",
      "wall_width": "Wall Width (mm)",
      "wall_height": "Wall Height (mm)",
      "block_params": "Block Parameters",
      "block_h": "Height",
      "block_l": "Length",
      "block_w": "Width",
      "block_o": "Offset",
      "no_windows": "No windows added.",
      "window": "Window",
      "visualization_ready": "Ready for visualization",
      "press_calculate_1": "Add windows and click 'Recalculate',",
      "press_calculate_2": "to generate the drawing.",
      "enter_dimensions": "Please enter wall dimensions!",
      "saved": "Saved!",
      "auth_error": "Authorization error or invalid data.",
      "error": "Error saving.",
      "max_windows": "Maximum number of windows is 30!",
      "delete_error": "Error deleting."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "lv",
    interpolation: { escapeValue: false }
  });

export default i18n;