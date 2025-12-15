import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://cxvlzzclkbqfvketymrw.supabase.co",
  "ef5cd10c-e10d-41b2-a1cc-841c7758fa4a"
);

const WORKSPACE_CODE = "mainengine-carbon";
let WORKSPACE_ID = null;
let entries = [];
let activeShop = "mainengine";

const form = document.getElementById("entryForm");
const listEl = document.getElementById("entryList");

async function auth() {
  const email = prompt("Email");
  const password = prompt("Passwort");

  let res = await supabase.auth.signInWithPassword({ email, password });
  if (res.error) {
    await supabase.auth.signUp({ email, password });
    res = await supabase.auth.signInWithPassword({ email, password });
  }
}

async function loadWorkspace() {
  const { data } = await supabase
    .from("workspaces")
    .select("id")
    .eq("code", WORKSPACE_CODE)
    .single();
  WORKSPACE_ID = data.id;
}

async function loadEntries() {
  const { data } = await supabase
    .from("entries")
    .select("*")
    .eq("workspace_id", WORKSPACE_ID);
  entries = data || [];
  render();
}

function render() {
  listEl.innerHTML = "";
  entries
    .filter(e => e.shop === activeShop)
    .forEach(e => {
      const li = document.createElement("li");
      li.textContent = `${e.date} · ${e.position} · ${e.profit} €`;
      listEl.appendChild(li);
    });
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const entry = {
    id: crypto.randomUUID(),
    workspace_id: WORKSPACE_ID,
    shop: activeShop,
    date: date.value,
    position: position.value,
    customer: customer.value,
    purchase_price: Number(purchasePrice.value || 0),
    sale_price: Number(salePrice.value || 0),
    expenses: Number(expenses.value || 0),
    profit: Number(profit.value || 0),
    deposit: Number(deposit.value || 0),
    due_date: dueDate.value || null,
    rest_paid: false,
    comment: comment.value
  };

  await supabase.from("entries").insert(entry);
  loadEntries();
  form.reset();
});

document.querySelectorAll(".shop-button").forEach(btn => {
  btn.onclick = () => {
    activeShop = btn.dataset.shop;
    document.querySelectorAll(".shop-button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  };
});

(async function init() {
  await auth();
  await loadWorkspace();
  await loadEntries();
})();
