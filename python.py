import streamlit as st
import pandas as pd
from datetime import date, timedelta

st.set_page_config(page_title="SubTrackr", page_icon="💳")

# ===== Simple CSS =====
st.markdown("""
<style>
h1 { color: #2a6db5; }
.stButton > button {
    background-color: #2a6db5;
    color: white;
    border-radius: 4px;
    border: none;
    padding: 6px 20px;
}
.stButton > button:hover { background-color: #1e5490; }
</style>
""", unsafe_allow_html=True)

# ===== Load / Save Data =====
CSV_FILE = "subscriptions.csv"
COLUMNS = ["Name", "Amount (₹)", "Due Date", "Category"]

def load_data():
    try:
        return pd.read_csv(CSV_FILE)
    except FileNotFoundError:
        return pd.DataFrame(columns=COLUMNS)

def save_data(df):
    df.to_csv(CSV_FILE, index=False)

# ===== Init =====
if "df" not in st.session_state:
    st.session_state.df = load_data()

df = st.session_state.df

# ===== Header =====
st.title("SubTrackr 💳")
st.write("Track your monthly subscriptions")
st.markdown("---")

# ===== Summary =====
col1, col2, col3 = st.columns(3)

total = df["Amount (₹)"].sum() if not df.empty else 0
active = len(df)

due_soon = 0
if not df.empty:
    today = date.today()
    soon = today + timedelta(days=7)
    for d in df["Due Date"]:
        try:
            due = date.fromisoformat(str(d))
            if today <= due <= soon:
                due_soon += 1
        except:
            pass

col1.metric("Total Monthly", f"₹{total}")
col2.metric("Active Subs", active)
col3.metric("Due Soon 🔴", due_soon)

st.markdown("---")

# ===== Add Form =====
st.subheader("Add New Subscription")

c1, c2 = st.columns(2)
name     = c1.text_input("Service Name", placeholder="e.g. Netflix")
amount   = c2.number_input("Amount (₹)", min_value=0, step=10)
due_date = c1.date_input("Due Date")
category = c2.selectbox("Category", ["Streaming", "Music", "Utility", "Gaming", "Software", "Other"])

if st.button("Add Subscription"):
    if name.strip() == "":
        st.warning("Please enter a service name.")
    else:
        new_row = pd.DataFrame([[name, amount, due_date, category]], columns=COLUMNS)
        st.session_state.df = pd.concat([st.session_state.df, new_row], ignore_index=True)
        save_data(st.session_state.df)
        st.success(f"{name} added!")
        st.rerun()

st.markdown("---")

# ===== Subscription List =====
st.subheader("My Subscriptions")

if st.session_state.df.empty:
    st.info("No subscriptions added yet.")
else:
    df = st.session_state.df.copy()

    # Add status column
    def get_status(d):
        try:
            due = date.fromisoformat(str(d))
            if due < date.today():
                return "⚠️ Overdue"
            elif due <= date.today() + timedelta(days=7):
                return "🟠 Due Soon"
            else:
                return "🟢 Active"
        except:
            return "—"

    df["Status"] = df["Due Date"].apply(get_status)

    st.dataframe(df, use_container_width=True, hide_index=True)

    # Delete a row
    st.markdown("**Remove a subscription:**")
    options = df["Name"].tolist()
    to_delete = st.selectbox("Select to remove", options)
    if st.button("Remove"): 
        st.session_state.df = st.session_state.df[st.session_state.df["Name"] != to_delete].reset_index(drop=True)
        save_data(st.session_state.df)
        st.success(f"{to_delete} removed.")
        st.rerun()

st.markdown("---")
st.caption("SubTrackr © 2025 · Never miss a payment again")