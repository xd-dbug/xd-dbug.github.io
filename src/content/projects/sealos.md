---
title: SealOS
summary: A higher-half x86_64 kernel written from scratch in Rust that boots under UEFI and runs user programs in Ring 3.
problem: I wanted to build a privacy-enhanced operating system, to learn not only what happens at that level (paging, privilege levels, syscalls) but also just to see if I could build it.
stack: [Rust, x86_64 Assembly, QEMU, UEFI]
role: Solo project, built as pre-capstone and capstone coursework (PRO390). Designed and wrote the kernel, the user-space crate, and the host-side build/run tool.
repo: https://github.com/xd-dbug/SealOS
license: MIT
cover: ./images/sealos-demo.png
coverAlt: SealOS running in a QEMU window. Its shell echoes text, reports an unknown command, shows the uptime counting up, and starts a new shell after exit 3.
featured: true
order: 1
date: 2026-11-15 # ongoing
draft: false
---

## Problem & motivation

The reason behind this project was simply to see if I could. When I was trying to come up with capstone ideas, all I knew was that I wanted it to be memorable. I was inspired by my seniors when I saw some of the things they made, and I knew I wanted my project to be just as great. The idea of writing my own operating system seemed interesting on the surface, and the more I dug in and researched it, the more motivated I became to complete the project.

## Demo

The screenshot above is SealOS booted in QEMU, running its user-space shell: `echo` prints its arguments, an unknown command is reported instead of crashing anything, `uptime` reads the timer, and when the shell exits with code 3 the kernel reaps it and starts a new one.

## How it works

The repo holds three separate Cargo projects: the `no_std` kernel, a `user/` crate of Ring 3 programs, and a host-side `runner` that builds a UEFI disk image and boots it in QEMU. They're kept apart because each needs its own target spec, and a nested `cargo build` inside one workspace deadlocks on the build lock.

- **Boot and output:** boots via UEFI (OVMF) to a graphical framebuffer. Text is rendered in software with a bitmap font, because legacy VGA text mode doesn't exist under UEFI. Serial output goes over COM1.
- **Memory:** a higher-half kernel linked at `0xffff_ffff_8000_0000`, with all physical memory mapped at `0xffff_8000_0000_0000`. 4-level paging, a physical frame allocator, and a kernel heap give it `Box`, `Vec` and `String` without the standard library.
- **Interrupts:** a GDT and IDT with handlers for CPU exceptions plus the timer and keyboard IRQs. A dedicated IST (Interrupt Stack Table) stack catches kernel stack overflows as double faults instead of triple-faulting the VM.
- **Threads:** a context switch in naked-function inline assembly and a round-robin scheduler. Tasks can yield, exit, or be preempted by a 10 ms timer tick. Allocating on the heap inside an interrupt handler is caught and panics.
- **User space:** user programs run in Ring 3 and enter the kernel through `syscall`/`sysret` (`write`, `exit`, `yield`). A fault in a user program kills only that task. User programs are ELF binaries, and the loader treats each one as untrusted input, checking every field and enforcing W^X before mapping anything.
- **Testing:** a custom `#![no_std]` test harness. Each integration test boots its own kernel image in QEMU and reports pass/fail through QEMU's `isa-debug-exit` device, so `cargo test` works end to end.

## Run it locally

You need:

- Rust nightly with `rust-src` (pinned in `rust-toolchain.toml`; `rustup` fetches it on the first build)
- QEMU (`qemu-system-x86_64` on your `PATH`)
- OVMF UEFI firmware at `/usr/share/OVMF/x64/` (Arch's `edk2-ovmf` layout; on other distros, edit the paths in `src/main.rs`)

```sh
git clone https://github.com/xd-dbug/SealOS
cd SealOS
cargo run                 # build and boot in QEMU
cd kernel && cargo test   # tests boot headless in QEMU
```

## What I learned / next steps

SealOS is still in progress, so this section covers next steps for now. Next is improving error handling in the user shell. After that come the stretch goals: an ELF file driver, more shell commands, ASLR, and a real GUI on boot.
