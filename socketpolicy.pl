#!/usr/bin/perl
#
# Simple Flash Socket Policy Server
# Based on Perl policy server by Jacqueline Kira Hamilton


use Socket;
use IO::Handle;

my $should_be_logging = 1;  # change to 0 to turn off logging.

my $logfile = 'log';

if ($should_be_logging) {
    open(LOG, ">$logfile") or warn "Can't open $logfile: $!\n";
    LOG->autoflush(1);
}

my $port = 843;
my $proto = getprotobyname('tcp');

# start the server:

      &log("Starting server on port $port");
    socket(Server, PF_INET, SOCK_STREAM, $proto) or die "socket: $!";
setsockopt(Server, SOL_SOCKET, SO_REUSEADDR, 1 ) or die "setsockopt: $!";
      bind(Server,sockaddr_in($port,INADDR_ANY)) or die "bind: $!";
    listen(Server,SOMAXCONN) or die "listen: $!";

    Server->autoflush( 1 );

my $paddr;
&log("Server started. Waiting for connections.");

$/ = "\0";      # reset terminator to null char

# listening loop.

for ( ; $paddr = accept(Client,Server); close Client) {
    Client->autoflush(1);
    my($port,$iaddr) = sockaddr_in($paddr);
    my $ip_address   = inet_ntoa($iaddr);
    my $name         = gethostbyaddr($iaddr,AF_INET) || $ip_address;
    &log( scalar localtime() . ": Connection from $name" );
 
    my $line = <Client>;
    &log("Input: $line");

    if ($line =~ /.*policy\-file.*/i) {
        print Client &xml_policy;
    }
}

sub xml_policy {
    my $str = qq(<cross-domain-policy><allow-access-from domain="*" to-ports="*" /></cross-domain-policy>\0);
    return $str;
}

sub log {
    my($msg) = @_;
    if ($should_be_logging) {
        print LOG $msg,"\n";
    }
}
