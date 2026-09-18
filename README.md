#  Network Relay (Subway-Sim)

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/Rust-1.75+-orange.svg)](https://www.rust-lang.org/)
[![Async](https://img.shields.io/badge/Runtime-Tokio-blue.svg)](https://tokio.rs/)
[![WinDivert](https://img.shields.io/badge/Driver-WinDivert-blueviolet.svg)](https://reqrypt.org/windivert.html)

A high-performance kernel-level network chaos simulator for Windows that allows you to test how your applications behave under poor network conditions like high latency, packet loss, and jitter.

Built with **Rust**, **Tokio**, and **WinDivert**, `network-relay` intercepts local network traffic in real-time to simulate real-world scenarios such as riding a subway, being in an elevator, or using a spotty 3G connection.

---

##  Features

- **Real-time Interception**: Uses WinDivert to capture and manipulate packets at the kernel level.
- **Predefined Profiles**: Quickly switch between common "bad network" scenarios:
  - `subway`: Spotty connection with 800ms latency and 10% packet loss.
  - `elevator`: Near dead-zone with 2.5s latency and 20% loss.
  - `mountain`: High-altitude latency (4s) with 5% loss.
  - `3g`: Standard slow mobile network (400ms latency, 2% loss).
  - `chaos`: Extreme jitter (1500ms latency, 35% packet loss).
- **Customizable**: Override profile defaults with your own latency and drop rate values.
- **TUI Dashboard**: A live terminal interface showing packet statistics and network stability graphs.
- **Multi-port Targeting**: Automatically targets common development ports (8080, 3000, 8000, 5000) or a specific port of your choice.

---

##  Getting Started

### Prerequisites

- **Windows**: This tool requires Windows for `WinDivert` support.
- **Administrator Privileges**: Packet interception requires running the terminal as an Administrator.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bhavukar/network-relay.git
   cd network-relay
   ```

2. Build the project:
   ```bash
   cargo build --release
   ```

### Usage

Run the simulator with a specific profile (must be run as Administrator):

```powershell
# Start with the default 'subway' profile
.\target\release\subway-sim.exe start

# Target a specific port with a custom profile
.\target\release\subway-sim.exe start --port 3000 --profile elevator

# Fully custom settings
.\target\release\subway-sim.exe start --port 8080 --latency 1500 --drop 15
```

---

##  Technical Stack

- **[WinDivert](https://reqrypt.org/windivert.html)**: Kernel-level packet interception.
- **[Ratatui](https://ratatui.rs/)**: Terminal UI for live monitoring.
- **[Tokio](https://tokio.rs/)**: Asynchronous runtime for handling packet delays without blocking.
- **[Clap](https://clap.rs/)**: Robust CLI argument parsing.

---

##  License

MIT © [Bhavuk Arora](https://github.com/bhavukar)

