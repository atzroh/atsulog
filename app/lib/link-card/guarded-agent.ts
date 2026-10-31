import "server-only";

import { lookup as dnsLookup } from "node:dns";
import { BlockList, isIP, type LookupFunction } from "node:net";

import { Agent, buildConnector } from "undici";

/** Anything but the public internet. IPv4-mapped IPv6 matches the IPv4 rules. */
const BLOCKED_ADDRESSES = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  BLOCKED_ADDRESSES.addSubnet(network, prefix, "ipv4");
}
for (const [network, prefix] of [
  ["::", 128],
  ["::1", 128],
  ["64:ff9b::", 96],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
] as const) {
  BLOCKED_ADDRESSES.addSubnet(network, prefix, "ipv6");
}

export class BlockedAddressError extends Error {}

/** Checks what DNS returns, so a public name pointing inward is caught too. */
const guardedLookup = ((hostname, options, callback) => {
  dnsLookup(hostname, options, (error, address, family) => {
    if (error) return callback(error, address, family);
    const addresses = Array.isArray(address) ? address : [{ address, family }];
    if (addresses.some((entry) => isBlockedAddress(entry.address))) {
      return callback(
        new BlockedAddressError(`Blocked address for ${hostname}`),
        address,
        family,
      );
    }
    callback(null, address, family);
  });
}) as LookupFunction;

const connect = buildConnector({ lookup: guardedLookup });

/**
 * Every connection, redirects included, is checked at the socket: an IP
 * literal skips the lookup, so it is checked here directly.
 */
export const guardedAgent = new Agent({
  connect(options, callback) {
    if (isIP(options.hostname) && isBlockedAddress(options.hostname)) {
      callback(
        new BlockedAddressError(`Blocked address ${options.hostname}`),
        null,
      );
      return;
    }
    connect(options, callback);
  },
});

// --- Helpers ---

function isBlockedAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 0) return true;
  return BLOCKED_ADDRESSES.check(address, family === 6 ? "ipv6" : "ipv4");
}
